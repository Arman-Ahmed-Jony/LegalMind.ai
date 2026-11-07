import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { pool } from '../db/pool';
import { HttpError } from '../httpError';
import type { DocumentRecord } from '../types';

const uploadsDir = path.resolve('uploads');

const allowed = new Map<string, string>([
  ['.pdf', 'application/pdf'],
  [
    '.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
]);

type DocumentRow = {
  id: string;
  case_id: string;
  original_filename: string;
  stored_filename: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: Date;
};

function toDocument(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    caseId: row.case_id,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    uploadedAt: row.uploaded_at.toISOString(),
  };
}

export async function ensureUploadsDir(): Promise<void> {
  await mkdir(uploadsDir, { recursive: true });
}

export async function listDocuments(caseId: string): Promise<DocumentRecord[]> {
  const result = await pool.query<DocumentRow>(
    `SELECT id, case_id, original_filename, stored_filename, mime_type, size_bytes, uploaded_at
     FROM documents
     WHERE case_id = $1
     ORDER BY uploaded_at DESC`,
    [caseId],
  );

  return result.rows.map(toDocument);
}

export async function saveDocument(
  caseId: string,
  file: { originalname: string; mimetype: string; buffer: Buffer },
): Promise<DocumentRecord> {
  const extension = path.extname(file.originalname).toLowerCase();
  const expectedMime = allowed.get(extension);

  if (!expectedMime) {
    throw new HttpError(400, 'Only PDF and DOCX files can be uploaded.');
  }

  if (file.mimetype !== expectedMime && file.mimetype !== 'application/octet-stream') {
    throw new HttpError(400, 'Only PDF and DOCX files can be uploaded.');
  }

  const id = randomUUID();
  const storedFilename = `${id}${extension}`;
  const originalFilename = path.basename(file.originalname).slice(0, 255);

  await ensureUploadsDir();
  await writeFile(path.join(uploadsDir, storedFilename), file.buffer);

  try {
    const result = await pool.query<DocumentRow>(
      `INSERT INTO documents (
         id, case_id, original_filename, stored_filename, mime_type, size_bytes
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, case_id, original_filename, stored_filename, mime_type, size_bytes, uploaded_at`,
      [id, caseId, originalFilename, storedFilename, expectedMime, file.buffer.length],
    );

    return toDocument(result.rows[0]);
  } catch (error) {
    await deleteStoredFiles([storedFilename]);
    throw error;
  }
}

export async function getDocumentFile(id: string): Promise<{
  absolutePath: string;
  document: DocumentRecord;
}> {
  const result = await pool.query<DocumentRow>(
    `SELECT id, case_id, original_filename, stored_filename, mime_type, size_bytes, uploaded_at
     FROM documents
     WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];

  if (!row || !isStoredName(row.stored_filename)) {
    throw new HttpError(404, 'Document not found.');
  }

  return {
    absolutePath: path.join(uploadsDir, row.stored_filename),
    document: toDocument(row),
  };
}

export async function deleteDocument(id: string): Promise<void> {
  const result = await pool.query<{ stored_filename: string }>(
    'DELETE FROM documents WHERE id = $1 RETURNING stored_filename',
    [id],
  );
  const storedFilename = result.rows[0]?.stored_filename;

  if (!storedFilename) {
    throw new HttpError(404, 'Document not found.');
  }

  await deleteStoredFiles([storedFilename]);
}

export async function deleteStoredFiles(names: string[]): Promise<void> {
  await Promise.all(
    names.filter(isStoredName).map(async (name) => {
      try {
        await unlink(path.join(uploadsDir, name));
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !('code' in error) ||
          error.code !== 'ENOENT'
        ) {
          throw error;
        }
      }
    }),
  );
}

function isStoredName(name: string): boolean {
  return /^[0-9a-f-]{36}\.(pdf|docx)$/i.test(name);
}
