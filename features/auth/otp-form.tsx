"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { useVerifyOtp } from "@/hooks/use-auth";
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

const otpFormSchema = z.object({
  code: z.string().length(6),
});

type OtpFormProps = {
  locale: string;
};

export function OtpForm({ locale }: OtpFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const verify = useVerifyOtp();

  const channel = (params.get("channel") ?? "email") as "email" | "phone";
  const destination = params.get("destination") ?? "";
  const purpose = (params.get("purpose") ?? "register") as "register" | "login" | "verify";

  const form = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = form.handleSubmit(async ({ code }) => {
    try {
      const result = await verify.mutateAsync({
        channel,
        destination,
        purpose,
        code,
      });
      if (purpose === "register" && result && "id" in result) {
        toast.success("Account created");
        router.replace(`/${locale}/sell`);
        router.refresh();
      } else {
        toast.success("Verified");
        router.push(`/${locale}/profile`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    }
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify OTP</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {destination || "you"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              {...form.register("code")}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={verify.isPending}>
            Verify
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
