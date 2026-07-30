"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useLogout } from "@/hooks/use-auth";
import { LoadingState } from "@/components/shared/loading-state";

type LogoutClientProps = {
  locale: string;
};

export function LogoutClient({ locale }: LogoutClientProps) {
  const router = useRouter();
  const logout = useLogout();

  useEffect(() => {
    void logout.mutateAsync().finally(() => {
      router.replace(`/${locale}`);
      router.refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingState label="Signing out…" />;
}
