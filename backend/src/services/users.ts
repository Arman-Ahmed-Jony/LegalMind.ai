import { pool } from '../db/pool';
import { HttpError, isUniqueViolation } from '../httpError';
import type { PublicUser, UserRole } from '../types';
import { findUserById, hashPassword, toPublicUser } from './auth';

type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
};

async function adminCount(): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM users WHERE role = 'admin'`,
  );

  return Number(result.rows[0]?.count ?? 0);
}

export async function listUsers(): Promise<PublicUser[]> {
  const result = await pool.query<UserRow>(
    `SELECT id, username, password_hash, role, created_at, updated_at
     FROM users
     ORDER BY username`,
  );

  return result.rows.map(toPublicUser);
}

export async function createUser(input: {
  username: string;
  password: string;
  role: UserRole;
}): Promise<PublicUser> {
  try {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, username, password_hash, role, created_at, updated_at`,
      [input.username, await hashPassword(input.password), input.role],
    );

    return toPublicUser(result.rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new HttpError(409, 'That username is already in use.');
    }

    throw error;
  }
}

export async function updateUser(
  id: string,
  input: { username?: string; password?: string; role?: UserRole },
): Promise<PublicUser> {
  const current = await findUserById(id);

  if (!current) {
    throw new HttpError(404, 'User not found.');
  }

  const nextRole = input.role ?? current.role;

  if (current.role === 'admin' && nextRole !== 'admin' && (await adminCount()) <= 1) {
    throw new HttpError(409, 'The last admin cannot be demoted.');
  }

  try {
    const result = await pool.query<UserRow>(
      `UPDATE users
       SET username = $2,
           password_hash = $3,
           role = $4,
           updated_at = now()
       WHERE id = $1
       RETURNING id, username, password_hash, role, created_at, updated_at`,
      [
        id,
        input.username ?? current.username,
        input.password ? await hashPassword(input.password) : current.password_hash,
        nextRole,
      ],
    );

    return toPublicUser(result.rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new HttpError(409, 'That username is already in use.');
    }

    throw error;
  }
}

export async function deleteUser(id: string, actorId: string): Promise<void> {
  if (id === actorId) {
    throw new HttpError(409, 'You cannot delete your own account.');
  }

  const current = await findUserById(id);

  if (!current) {
    throw new HttpError(404, 'User not found.');
  }

  if (current.role === 'admin' && (await adminCount()) <= 1) {
    throw new HttpError(409, 'The last admin cannot be deleted.');
  }

  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}
