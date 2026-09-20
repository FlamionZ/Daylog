'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  loginWithPasswordSchema,
  loginWithOtpSchema,
  signUpSchema,
  type LoginWithPasswordInput,
  type LoginWithOtpInput,
  type SignUpInput,
} from '../schemas/login-schema';
import {
  signInWithPassword,
  signInWithOtp,
  signUpWithPassword,
} from '../actions/auth-actions';

export function LoginForm() {
  const [activeTab, setActiveTab] = React.useState<'password' | 'signup' | 'otp'>('password');
  const [isPending, startTransition] = React.useTransition();

  // Password login form
  const passwordForm = useForm<LoginWithPasswordInput>({
    resolver: zodResolver(loginWithPasswordSchema),
    defaultValues: { email: '', password: '' },
  });

  // Sign up form
  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  // Magic link form
  const otpForm = useForm<LoginWithOtpInput>({
    resolver: zodResolver(loginWithOtpSchema),
    defaultValues: { email: '' },
  });

  const handlePasswordLogin = (data: LoginWithPasswordInput) => {
    startTransition(async () => {
      const result = await signInWithPassword(data);
      if (result && !result.success && result.error) {
        toast.error(result.error);
      }
    });
  };

  const handleSignUp = (data: SignUpInput) => {
    startTransition(async () => {
      const result = await signUpWithPassword(data);
      if (result.success) {
        toast.success(result.message || 'Pendaftaran berhasil!');
        setActiveTab('password');
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  const handleOtpLogin = (data: LoginWithOtpInput) => {
    startTransition(async () => {
      const result = await signInWithOtp(data);
      if (result.success) {
        toast.success(result.message || 'Tautan login terkirim!');
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'password' | 'signup' | 'otp')}
      >
        <TabsList className="grid w-full grid-cols-3 rounded-full border border-border/70 bg-secondary/50 p-1 mb-6 h-11">
          <TabsTrigger
            value="password"
            className="rounded-full text-xs font-semibold py-2 transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            Kata Sandi
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="rounded-full text-xs font-semibold py-2 transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            Daftar
          </TabsTrigger>
          <TabsTrigger
            value="otp"
            className="rounded-full text-xs font-semibold py-2 transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            Magic Link
          </TabsTrigger>
        </TabsList>

        {/* 1. Masuk (Password) */}
        <TabsContent value="password">
          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordLogin)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-xs font-semibold text-foreground/80">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="nama@email.com"
                  className="h-10 rounded-full border border-border/80 bg-secondary/30 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  disabled={isPending}
                  {...passwordForm.register('email')}
                />
              </div>
              {passwordForm.formState.errors.email && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {passwordForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-xs font-semibold text-foreground/80">
                  Kata Sandi
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className="h-10 rounded-full border border-border/80 bg-secondary/30 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  disabled={isPending}
                  {...passwordForm.register('password')}
                />
              </div>
              {passwordForm.formState.errors.password && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 rounded-full bg-primary text-primary-foreground font-bold text-xs py-2.5 shadow-xs hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk dengan Email
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        {/* 2. Daftar (Sign Up) */}
        <TabsContent value="signup">
          <form
            onSubmit={signUpForm.handleSubmit(handleSignUp)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-xs font-semibold text-foreground/80">
                Nama Lengkap
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
                <Input
                  id="signup-name"
                  placeholder="Rakha Pratama"
                  className="h-10 rounded-full border border-border/80 bg-secondary/30 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  disabled={isPending}
                  {...signUpForm.register('fullName')}
                />
              </div>
              {signUpForm.formState.errors.fullName && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {signUpForm.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-xs font-semibold text-foreground/80">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="nama@email.com"
                  className="h-10 rounded-full border border-border/80 bg-secondary/30 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  disabled={isPending}
                  {...signUpForm.register('email')}
                />
              </div>
              {signUpForm.formState.errors.email && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {signUpForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-xs font-semibold text-foreground/80">
                Kata Sandi
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  className="h-10 rounded-full border border-border/80 bg-secondary/30 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  disabled={isPending}
                  {...signUpForm.register('password')}
                />
              </div>
              {signUpForm.formState.errors.password && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {signUpForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 rounded-full bg-primary text-primary-foreground font-bold text-xs py-2.5 shadow-xs hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                <>
                  Daftar Akun Baru
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        {/* 3. Magic Link */}
        <TabsContent value="otp">
          <form
            onSubmit={otpForm.handleSubmit(handleOtpLogin)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="otp-email" className="text-xs font-semibold text-foreground/80">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
                <Input
                  id="otp-email"
                  type="email"
                  placeholder="nama@email.com"
                  className="h-10 rounded-full border border-border/80 bg-secondary/30 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  disabled={isPending}
                  {...otpForm.register('email')}
                />
              </div>
              {otpForm.formState.errors.email && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {otpForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Kami akan mengirimkan tautan sekali pakai ke email kamu untuk masuk langsung tanpa kata sandi.
            </p>

            <Button
              type="submit"
              className="w-full h-10 rounded-full bg-primary text-primary-foreground font-bold text-xs py-2.5 shadow-xs hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Mengirim tautan...
                </>
              ) : (
                <>
                  Kirim Magic Link
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
