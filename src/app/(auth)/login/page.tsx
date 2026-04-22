"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AuthForm } from "@/components/forms/AuthForm";
import { FormField } from "@/components/forms/FormField";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await authClient.signIn.email(form);

    if (error) {
      setError("Invalid credentials or email not verified, please check your email and try again.");
      return;
    }

    // 🔥 Fetch real user (with role)
    const res = await fetch("/api/user");

    if (!res.ok) {
      setError("Failed to load user data");
      return;
    }

    const user = await res.json();

    // Role-based redirect. /admin has its own role check and redirects
    // to /admin/inventory, so pointing there avoids hard-coding the
    // current landing route — if we add a real dashboard later, the
    // redirect chain changes in one place.
    if (user.role === "admin") {
      router.refresh();
      router.push("/admin");
    } else {
      router.refresh();
      router.push("/shop");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AuthForm onSubmit={handleSubmit} submitLabel="Login" error={error}>
        <h1 className="text-xl font-bold text-center">Login</h1>

        <FormField
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => setForm({ ...form, email: value })}
          required
        />

        <FormField
          label="Password"
          type="password"
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
          required
        />
      </AuthForm>
    </div>
  );
}