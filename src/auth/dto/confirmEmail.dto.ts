import z from 'zod';

export const resendEmailOTPSchema = z.strictObject({
  email: z.email(),
});
export const confirmEmailSchema = resendEmailOTPSchema.extend({
  otp: z.string().length(6, { error: 'Invalid OTP' }),
});

export type ConfirmEmailDto = z.infer<typeof confirmEmailSchema>;
