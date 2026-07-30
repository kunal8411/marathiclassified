"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";
import type { SessionUser } from "@/types";
import type { LoginInput } from "@/services/auth.service";
import { loginSchema, registerSchema } from "@/validators";
import type { z } from "zod";

export const authQueryKey = ["auth", "me"] as const;

export function useAuth() {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: async () => {
      const res = await apiFetch<SessionUser>("/api/auth/me");
      if (!res.success) return null;
      return res.data;
    },
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: z.infer<typeof loginSchema>) => {
      const res = await apiFetch<SessionUser>("/api/auth/login", {
        method: "POST",
        body: input satisfies LoginInput,
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: (user) => {
      qc.setQueryData(authQueryKey, user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: z.infer<typeof registerSchema>) => {
      const res = await apiFetch<{ sent: true }>("/api/otp/send", {
        method: "POST",
        body: {
          channel: input.email ? "email" : "phone",
          destination: (input.email ?? input.phone)!,
          purpose: "register",
          name: input.name,
          password: input.password,
        },
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiFetch<{ loggedOut: true }>("/api/auth/logout", {
        method: "POST",
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      qc.setQueryData(authQueryKey, null);
      qc.invalidateQueries({ queryKey: authQueryKey });
    },
  });
}

export function useVerifyOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      channel: "email" | "phone";
      destination: string;
      purpose: "register" | "login" | "verify";
      code: string;
    }) => {
      const res = await apiFetch<SessionUser>("/api/otp/verify", {
        method: "POST",
        body,
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: (user) => {
      qc.setQueryData(authQueryKey, user);
    },
  });
}
