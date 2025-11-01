import z from 'zod';

export const loginSchema = z.strictObject({
  email: z.email(),
  password: z.string(),
});

export type LoginDto = z.infer<typeof loginSchema>;
