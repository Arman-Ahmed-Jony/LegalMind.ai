import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 3000,
});

pool.on('error', (error: Error) => {
  console.error('PostgreSQL pool error:', error.message);
});

export async function checkDatabase(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const result = await pool.query<{ ok: number }>('SELECT 1 AS ok');
  const value = Number(result.rows[0]?.ok);

  if (value !== 1) {
    throw new Error('PostgreSQL did not return the expected result');
  }
}
