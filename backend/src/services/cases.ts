import { pool } from '../db/pool';
import { HttpError } from '../httpError';
import type { CaseSummary } from '../types';
import { getClient, toCase } from './clients';
import { deleteStoredFiles } from './documents';

type CaseRow = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function getCase(id: string): Promise<CaseSummary> {
  const result = await pool.query<CaseRow>(
    `SELECT id, client_id, title, description, created_at, updated_at
     FROM cases
     WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];

  if (!row) {
    throw new HttpError(404, 'Case not found.');
  }

  return toCase(row);
}

export async function createCase(
  clientId: string,
  input: { title: string; description?: string | null },
): Promise<CaseSummary> {
  await getClient(clientId);

  const result = await pool.query<CaseRow>(
    `INSERT INTO cases (client_id, title, description)
     VALUES ($1, $2, $3)
     RETURNING id, client_id, title, description, created_at, updated_at`,
    [clientId, input.title, blankToNull(input.description)],
  );

  return toCase(result.rows[0]);
}

export async function updateCase(
  id: string,
  input: { title: string; description?: string | null },
): Promise<CaseSummary> {
  const result = await pool.query<CaseRow>(
    `UPDATE cases
     SET title = $2, description = $3, updated_at = now()
     WHERE id = $1
     RETURNING id, client_id, title, description, created_at, updated_at`,
    [id, input.title, blankToNull(input.description)],
  );
  const row = result.rows[0];

  if (!row) {
    throw new HttpError(404, 'Case not found.');
  }

  return toCase(row);
}

export async function deleteCase(id: string): Promise<void> {
  const files = await pool.query<{ stored_filename: string }>(
    'SELECT stored_filename FROM documents WHERE case_id = $1',
    [id],
  );
  const result = await pool.query('DELETE FROM cases WHERE id = $1', [id]);

  if (!result.rowCount) {
    throw new HttpError(404, 'Case not found.');
  }

  await deleteStoredFiles(files.rows.map((row) => row.stored_filename));
}

function blankToNull(value: string | null | undefined): string | null {
  if (value === undefined || value === null || value.trim() === '') {
    return null;
  }

  return value;
}
