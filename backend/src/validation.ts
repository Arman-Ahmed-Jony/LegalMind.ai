import { z } from 'zod';

import { HttpError } from './httpError';

const username = z.string().trim().min(1).max(64);
const password = z.string().min(1).max(72);
const role = z.enum(['admin', 'member']);

export const loginBody = z.object({
  username,
  password: z.string().min(1).max(72),
});

export const createUserBody = z.object({
  username,
  password,
  role,
});

export const updateUserBody = z
  .object({
    username: username.optional(),
    password: password.optional(),
    role: role.optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'Provide a username, password, or role to update.',
  });

export const clientBody = z.object({
  name: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(5000).nullable().optional(),
});

export const caseBody = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
});

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid request.';
    throw new HttpError(400, message);
  }

  return result.data;
}
