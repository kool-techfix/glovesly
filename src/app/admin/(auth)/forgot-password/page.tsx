import type { Metadata } from "next";

import { AuthLayout } from "@/components/admin/auth-layout";
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot your password?" description="Enter your account email and we will send you a link to choose a new one.">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
