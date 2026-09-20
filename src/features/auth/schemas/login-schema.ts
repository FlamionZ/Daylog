import { z } from 'zod';

export const loginWithPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const loginWithOtpSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

export const signUpSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type LoginWithPasswordInput = z.infer<typeof loginWithPasswordSchema>;
export type LoginWithOtpInput = z.infer<typeof loginWithOtpSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
