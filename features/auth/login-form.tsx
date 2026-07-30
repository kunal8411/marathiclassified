"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { useLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LoginFormProps = {
  locale: string;
};

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({ locale }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const isMarathi = locale === "mr";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login.mutateAsync({
        email: values.email,
        phone: undefined,
        password: values.password,
      });
      toast.success(isMarathi ? "स्वागत है" : "Welcome back!");
      const next = searchParams.get("next") ?? `/${locale}/sell`;
      router.replace(next);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : isMarathi ? "लॉगिन विफल" : "Login failed";
      toast.error(message);
    }
  });

  return (
    <div className="mx-auto max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {isMarathi ? "साइन इन" : "Sign In"}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {isMarathi
            ? "अपने खाते में साइन इन करें"
            : "Sign in to your account"}
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">
            {isMarathi ? "लॉगिन" : "Login"}
          </CardTitle>
          <CardDescription>
            {isMarathi
              ? "अपना ईमेल और पासवर्ड दर्ज करें"
              : "Enter your email and password"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                {isMarathi ? "ईमेल" : "Email"}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={isMarathi ? "आपका ईमेल" : "your@email.com"}
                {...form.register("email")}
                disabled={login.isPending}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                {isMarathi ? "पासवर्ड" : "Password"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={isMarathi ? "••••••••" : "••••••••"}
                {...form.register("password")}
                disabled={login.isPending}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending}
              size="lg"
            >
              {login.isPending
                ? isMarathi
                  ? "साइन इन किया जा रहा है..."
                  : "Signing in..."
                : isMarathi
                  ? "साइन इन करें"
                  : "Sign In"}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-slate-950 px-2 text-slate-600 dark:text-slate-400">
                  {isMarathi ? "या" : "or"}
                </span>
              </div>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              {isMarathi ? "खाता नहीं है?" : "Don't have an account?"}{" "}
              <Link
                href={`/${locale}/register`}
                className="font-medium text-orange-600 hover:text-orange-700 dark:hover:text-orange-400"
              >
                {isMarathi ? "साइन अप करें" : "Sign up"}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Additional info */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-center text-sm text-blue-900 dark:text-blue-200">
        {isMarathi
          ? "डेमो के लिए: admin@marathiclassifieds.com / Admin@12345"
          : "Demo: admin@marathiclassifieds.com / Admin@12345"}
      </div>
    </div>
  );
}
