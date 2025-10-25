import { GenderEnum } from 'src/common/enums/user.enum';
import z from 'zod';

export const signupSchema = z
  .strictObject({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    password: z
      .string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    confirmPassword: z.string(),
    GenderEnum: z.enum(GenderEnum).optional().default(GenderEnum.MALE),
    phoneNumber: z
      .string()
      .regex(/^(\+20|0)1(0|1|2|5)+([0-9]{8})$/)
      .optional(),
    /// min age is 12
    DOB: z.coerce
      .date()
      .min(new Date('1900-01-01'), {
        message: 'Date of birth cannot be before 1900',
      })
      .max(new Date(new Date().setFullYear(new Date().getFullYear() - 12)), {
        message: 'You must be at least 12 years old',
      }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
      });
    }
  });

export type SignupDto = z.infer<typeof signupSchema>;
