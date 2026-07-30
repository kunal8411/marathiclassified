"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { updateProfileSchema } from "@/validators";
import { apiFetch } from "@/lib/api/client";
import type { Locale } from "@/config/site";
import type { PublicProfile } from "@/services/user.service";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/shared/loading-state";

type ProfileEditFormProps = {
  locale: Locale;
};

export function ProfileEditForm({ locale }: ProfileEditFormProps) {
  const router = useRouter();
  const { data: user, isLoading, refetch } = useAuth();
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      name: user?.name ?? "",
      bio: "",
      image: user?.image ?? "",
    },
  });

  if (isLoading) return <LoadingState label="Loading…" />;
  if (!user) return null;

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await apiFetch<PublicProfile>("/api/users/me", {
      method: "PATCH",
      body: values,
    });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success("Profile updated");
    await refetch();
    router.push(`/${locale}/profile`);
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-4 rounded-xl border bg-card p-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={4} {...form.register("bio")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Avatar URL</Label>
        <Input id="image" {...form.register("image")} />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );
}
