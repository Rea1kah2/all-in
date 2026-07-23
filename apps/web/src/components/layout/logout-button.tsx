"use client";

import { useTranslations } from "next-intl";
import { LogoutIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLogout, useSession } from "@/features/auth/use-auth";

export function LogoutButton() {
  const t = useTranslations("userMenu");
  const tConfirm = useTranslations("confirm");
  const { data: user } = useSession();
  const logout = useLogout();

  if (!user) {
    return null;
  }

  return (
    <ConfirmDialog
      destructive
      title={tConfirm("logoutTitle")}
      description={tConfirm("logoutBody")}
      confirmLabel={tConfirm("logoutConfirm")}
      loading={logout.isPending}
      onConfirm={() => logout.mutate()}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          loading={logout.isPending}
          aria-label={t("logout")}
          title={t("logout")}
        >
          {logout.isPending ? null : <LogoutIcon size={18} />}
        </Button>
      }
    />
  );
}
