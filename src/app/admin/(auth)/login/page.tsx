import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthLayout } from "@/components/admin/auth-layout";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentActor } from "@/lib/auth/auth-guard";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  if (await getCurrentActor()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <AuthLayout title="Sign in" description="Use your workspace account.">
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </AuthLayout>
  );
}
