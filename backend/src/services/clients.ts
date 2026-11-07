import { pool } from '../db/pool';
import { HttpError } from '../httpError';
import type { CaseSummary, Client } from '../types';

type ClientRow = {
  id: string;
  name: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

type CaseRow = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    notes: row.notes,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export function toCase(row: CaseRow): CaseSummary {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    description: row.description,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listClients(): Promise<Client[]> {
  const result = await pool.query<ClientRow>(
    `SELECT id, name, notes, created_at, updated_at
     FROM clients
     ORDER BY name`,
  );

  return result.rows.map(toClient);
}

export async function getClient(id: string): Promise<Client> {
  const result = await pool.query<ClientRow>(
    `SELECT id, name, notes, created_at, updated_at
     FROM clients
     WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];

  if (!row) {
    throw new HttpError(404, 'Client not found.');
  }

  return toClient(row);
}

export async function listCasesForClient(clientId: string): Promise<CaseSummary[]> {
  const result = await pool.query<CaseRow>(
    `SELECT id, client_id, title, description, created_at, updated_at
     FROM cases
     WHERE client_id = $1
     ORDER BY title`,
    [clientId],
  );

  return result.rows.map(toCase);
}

export async function createClient(input: {
  name: string;
  notes?: string | null;
}): Promise<Client> {
  const result = await pool.query<ClientRow>(
    `INSERT INTO clients (name, notes)
     VALUES ($1, $2)
     RETURNING id, name, notes, created_at, updated_at`,
    [input.name, blankToNull(input.notes)],
  );

  return toClient(result.rows[0]);
}

export async function updateClient(
  id: string,
  input: { name: string; notes?: string | null },
): Promise<Client> {
  const result = await pool.query<ClientRow>(
    `UPDATE clients
     SET name = $2, notes = $3, updated_at = now()
     WHERE id = $1
     RETURNING id, name, notes, created_at, updated_at`,
    [id, input.name, blankToNull(input.notes)],
  );
  const row = result.rows[0];

  if (!row) {
    throw new HttpError(404, 'Client not found.');
  }

  return toClient(row);
}

export async function deleteClient(id: string): Promise<void> {
  const cases = await pool.query(
    'SELECT 1 FROM cases WHERE client_id = $1 LIMIT 1',
    [id],
  );

  if (cases.rowCount) {
    throw new HttpError(409, 'Delete this client’s cases before deleting the client.');
  }

  const result = await pool.query('DELETE FROM clients WHERE id = $1', [id]);

  if (!result.rowCount) {
    throw new HttpError(404, 'Client not found.');
  }
}

function blankToNull(value: string | null | undefined): string | null {
  if (value === undefined || value === null || value.trim() === '') {
    return null;
  }

  return value;
}
