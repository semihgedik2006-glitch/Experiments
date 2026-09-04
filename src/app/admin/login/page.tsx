import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin-Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
      <p className="mb-8 text-lg font-semibold tracking-tight">
        Körper<span className="text-accent">formen</span> Admin
      </p>
      <LoginForm />
    </div>
  );
}
