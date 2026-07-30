"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";

import { apiFetch } from "@/lib/api/client";
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

type RegisterFormProps = {
  locale: string;
};

const signupSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type SignupFormData = z.infer<typeof signupSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const isMarathi = locale === "mr";
  const [step, setStep] = useState<"signup" | "otp">("signup"); // Track signup or OTP verification step
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Signup Form
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Step 2: OTP Verification Form
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Step 1: Submit signup
  const onSignupSubmit = signupForm.handleSubmit(async (values) => {
    try {
      setLoading(true);
      // Send OTP
      const res = await apiFetch<{ sent: true }>("/api/auth/register", {
        method: "POST",
        body: {
          email: values.email,
          password: values.password,
          name: values.email.split("@")[0],
        },
      });

      if (!res.success) {
        throw new Error(res.error.message);
      }

      toast.success(
        isMarathi ? "OTP भेजा गया" : "OTP sent to your email!"
      );
      setEmail(values.email);
      setPassword(values.password);
      setStep("otp");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : isMarathi ? "विफल" : "Failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  });

  // Step 2: Submit OTP
  const onOtpSubmit = otpForm.handleSubmit(async (values) => {
    try {
      setLoading(true);
      // Verify OTP and create user
      const res = await apiFetch<{ success: boolean }>(
        "/api/otp/verify",
        {
          method: "POST",
          body: {
            channel: "email",
            destination: email,
            code: values.otp,
            purpose: "register",
          },
        }
      );

      if (!res.success) {
        throw new Error(res.error.message);
      }

      toast.success(isMarathi ? "खाता बनाया गया!" : "Account created!");
      // Auto login after successful registration
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      router.push(`/${locale}/sell`);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : isMarathi ? "विफल" : "Failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mx-auto max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {isMarathi ? "साइन अप" : "Sign Up"}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {step === "signup"
            ? isMarathi
              ? "एक नया खाता बनाएं"
              : "Create a new account"
            : isMarathi
              ? "अपना OTP दर्ज करें"
              : "Enter the OTP sent to your email"}
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        {/* Step 1: Signup */}
        {step === "signup" && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">
                {isMarathi ? "पंजीकरण" : "Create Account"}
              </CardTitle>
              <CardDescription>
                {isMarathi
                  ? "Step 1/2: आपका ईमेल और पासवर्ड दर्ज करें"
                  : "Step 1/2: Email and password"}
              </CardDescription>
            </CardHeader>

            <form onSubmit={onSignupSubmit} className="space-y-4">
              <CardContent className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {isMarathi ? "ईमेल" : "Email Address"}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={isMarathi ? "आपका ईमेल" : "your@email.com"}
                    {...signupForm.register("email")}
                    disabled={loading}
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {signupForm.formState.errors.email.message}
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
                    placeholder={isMarathi ? "••••••••" : "At least 6 characters"}
                    {...signupForm.register("password")}
                    disabled={loading}
                  />
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {isMarathi ? "पासवर्ड की पुष्टि करें" : "Confirm Password"}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={isMarathi ? "••••••••" : "Repeat password"}
                    {...signupForm.register("confirmPassword")}
                    disabled={loading}
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  size="lg"
                >
                  {loading
                    ? isMarathi
                      ? "भेजा जा रहा है..."
                      : "Sending OTP..."
                    : isMarathi
                      ? "अगला चरण"
                      : "Next: Verify OTP"}
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

                {/* Login link */}
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  {isMarathi ? "पहले से खाता है?" : "Already have an account?"}{" "}
                  <Link
                    href={`/${locale}/login`}
                    className="font-medium text-orange-600 hover:text-orange-700 dark:hover:text-orange-400"
                  >
                    {isMarathi ? "लॉगिन करें" : "Sign in"}
                  </Link>
                </p>
              </CardFooter>
            </form>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">
                {isMarathi ? "OTP सत्यापन" : "Verify OTP"}
              </CardTitle>
              <CardDescription>
                {isMarathi
                  ? "Step 2/2: हमने एक 6-अंकीय OTP भेजा है"
                  : "Step 2/2: Check your email for a 6-digit code"}
              </CardDescription>
            </CardHeader>

            <form onSubmit={onOtpSubmit} className="space-y-4">
              <CardContent className="space-y-4">
                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label>
                    {isMarathi ? "ईमेल" : "Email"}
                  </Label>
                  <div className="rounded-lg bg-slate-100 dark:bg-slate-900 px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
                    {email}
                  </div>
                </div>

                {/* OTP Input */}
                <div className="space-y-2">
                  <Label htmlFor="otp">
                    {isMarathi ? "6-अंकीय OTP" : "6-Digit OTP"}
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder={isMarathi ? "000000" : "000000"}
                    maxLength={6}
                    {...otpForm.register("otp")}
                    disabled={loading}
                    className="text-center text-2xl tracking-widest"
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="text-sm text-red-500">
                      {otpForm.formState.errors.otp.message}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isMarathi
                      ? "अपने ईमेल में OTP खोजें"
                      : "Check your email inbox"}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  size="lg"
                >
                  {loading
                    ? isMarathi
                      ? "सत्यापित किया जा रहा है..."
                      : "Verifying..."
                    : isMarathi
                      ? "खाता बनाएं"
                      : "Create Account"}
                </Button>

                {/* Back button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep("signup")}
                  disabled={loading}
                >
                  {isMarathi ? "वापस" : "Back"}
                </Button>
              </CardFooter>
            </form>
          </>
        )}
      </Card>

      {/* Info box */}
      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 text-center text-sm text-amber-900 dark:text-amber-200">
        {isMarathi
          ? "✨ 1. ईमेल & पासवर्ड दर्ज करें\n2. OTP सत्यापित करें\n3. खाता बनाया गया!"
          : "✨ 1. Enter email & password\n2. Verify OTP from email\n3. Account created!"}
      </div>
    </div>
  );
}
