"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { AuthForm } from "@/components/forms/AuthForm";
import { FormField } from "@/components/forms/FormField";

export default function LoginPage() {

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

    if (res.status === 403) {
      const data = await res.json();
      await authClient.signOut();
      setError(data.error || "Your account has been deactivated. Please contact support.");
      return;
    }

    if (!res.ok) {
      setError("Failed to load user data");
      return;
    }

    const user = await res.json();

    // Role-based redirect. /admin has its own role check and redirects
    // to /admin/inventory, so pointing there avoids hard-coding the
    // current landing route — if we add a real dashboard later, the
    // redirect chain changes in one place.
    // Full reload — forces the root layout to re-render server-side with the
    // correct session. Client-side router.push() would reuse the cached layout,
    // leaving the Navbar showing the pre-login (unauthenticated) state.
    if (user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/shop";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AuthForm onSubmit={handleSubmit} submitLabel="Log In" error={error}>
        {/* text-2xl (up from text-xl) + font-semibold + text-slate-950 for high-contrast Garamond heading */}
        <h1 className="text-2xl font-semibold text-slate-950 text-center">Log In</h1>

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
        {/* text-base (up from text-sm) throughout for Garamond legibility */}
        <div className="flex items-center justify-between text-base">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-950 font-medium">
            <input
              id="remember-me"
              type="checkbox"
              checked={form.rememberMe}
              onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
              className="w-4 h-4 rounded border-slate-400 text-yellow-700 focus:ring-yellow-600 cursor-pointer"
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

        <div className="flex flex-col gap-2 pt-4 border-t border-slate-200">
          {/* text-base (up from text-sm) + text-slate-800 (up from text-gray-600) */}
          <p className="text-base text-center text-slate-800">
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