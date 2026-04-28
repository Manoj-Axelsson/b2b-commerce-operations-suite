"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { AuthForm } from "@/components/forms/AuthForm";
import { FormField } from "@/components/forms/FormField";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await authClient.signIn.email({
      email: form.email,
      password: form.password,
      rememberMe: form.rememberMe,
    });

    if (error) {
      setError("Invalid credentials or email not verified, please check your email and try again.");
      return;
    }

    // Fetch real user (with role)
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
      <AuthForm onSubmit={handleSubmit} submitLabel="Log In" error={error}>
        <h1 className="text-xl font-bold text-center">Log In</h1>

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

        {/* Remember me + Forgot password row */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
            <input
              id="remember-me"
              type="checkbox"
              checked={form.rememberMe}
              onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-yellow-700 focus:ring-yellow-600 cursor-pointer"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-yellow-700 font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
          <p className="text-sm text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-yellow-700 font-bold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </AuthForm>
    </div>
  );
}