import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { pool } from '../db/pool';
import { HttpError } from '../httpError';
import type { PublicUser, UserRole } from '../types';

export const authCookieName = 'legalmind_token';

type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
};

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new HttpError(500, 'AUTH_SECRET is not set.');
  }

  return secret;
}

export function authCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, username, password_hash, role, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function findUserByUsername(
  username: string,
): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, username, password_hash, role, created_at, updated_at
     FROM users
     WHERE username = $1`,
    [username],
  );

  return result.rows[0] ?? null;
}

export async function login(
  username: string,
  password: string,
): Promise<{ user: PublicUser; token: string }> {
  const user = await findUserByUsername(username);
  const matches =
    user !== null && (await bcrypt.compare(password, user.password_hash));

  if (!user || !matches) {
    throw new HttpError(401, 'Invalid username or password.');
  }

  const token = jwt.sign({ sub: user.id }, authSecret(), { expiresIn: '7d' });

  return { user: toPublicUser(user), token };
}

export function readUserId(token: string): string {
  try {
    const payload = jwt.verify(token, authSecret());

    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      throw new HttpError(401, 'Sign in required.');
    }

    return payload.sub;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(401, 'Sign in required.');
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
