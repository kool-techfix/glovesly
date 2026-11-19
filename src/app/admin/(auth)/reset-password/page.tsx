import type { Metadata } from "next";

import { AuthLayout } from "@/components/admin/auth-layout";
import { ResetPasswordForm } from "@/components/admin/reset-password-form";

export const metadata: Metadata = { title: "Choose a password", referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return (
    <AuthLayout title="Choose a password">
      <ResetPasswordForm token={typeof token === "string" ? token : ""} />
    </AuthLayout>
  );
}
