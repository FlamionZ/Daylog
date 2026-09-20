'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loginWithPasswordSchema,
  loginWithOtpSchema,
  signUpSchema,
  type LoginWithPasswordInput,
  type LoginWithOtpInput,
  type SignUpInput,
} from '../schemas/login-schema';

export type AuthActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function signInWithPassword(
  input: LoginWithPasswordInput,
): Promise<AuthActionResult> {
  const parsed = loginWithPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error:
        error.message === 'Invalid login credentials'
          ? 'Email atau password salah.'
          : error.message,
    };
  }

  redirect('/dashboard');
}

export async function signInWithOtp(
  input: LoginWithOtpInput,
): Promise<AuthActionResult> {
  const parsed = loginWithOtpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Tautan login telah dikirim ke email kamu.',
  };
}

export async function signUpWithPassword(
  input: SignUpInput,
): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Pendaftaran berhasil. Silakan cek email untuk verifikasi atau langsung login.',
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
