import { z } from 'zod';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=\[\]{}|;:',.<>/]).{8,50}$/;
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((val) => {
      const date = new Date(val);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      return !isNaN(date.getTime()) && age >= 13 && date < now;
    }, 'You must be at least 13 years old'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(50, 'Password cannot exceed 50 characters')
    .regex(
      PASSWORD_REGEX,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
});