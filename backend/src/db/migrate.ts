import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { pool } from './pool';

const migrationsDir = path.resolve('database/migrations');

async function migrate(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((name) => name.endsWith('.sql'))
    .sort();

  for (const filename of files) {
    const existing = await pool.query(
      'SELECT 1 FROM schema_migrations WHERE filename = $1',
      [filename],
    );

    if (existing.rowCount) {
      continue;
    }

    const sql = await readFile(path.join(migrationsDir, filename), 'utf8');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [filename],
      );
      await client.query('COMMIT');
      console.log(`Applied ${filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

migrate()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    await pool.end();
    process.exit(1);
  });
