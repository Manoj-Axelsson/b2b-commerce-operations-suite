"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { AuthForm } from "@/components/forms/AuthForm";
import { FormField } from "@/components/forms/FormField";


export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await authClient.signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(error.message || "Signup failed");
      return;
    }

    setSuccess("Account created successfully! Redirecting to login...");
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AuthForm onSubmit={handleSubmit} submitLabel="Register" error={error}>
        {/* text-2xl + font-semibold + text-slate-950 — matches login heading style */}
        <h1 className="text-2xl font-semibold text-slate-950 text-center">Register</h1>

        <FormField
          label="Name"
          type="text"
          value={form.name}
          onChange={(value) => setForm({ ...form, name: value })}
          required
        />

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

        {/* text-base (up from text-sm) + text-green-700 for high-contrast success state */}
        {success && <p className="text-base font-medium text-green-700 text-center">{success}</p>}

        <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 mt-4">
          {/* text-base (up from text-sm) + text-slate-800 for contrast */}
          <p className="text-base text-center text-slate-800">
            Already have an account?{" "}
            <Link href="/login" className="text-yellow-700 font-bold hover:underline">
              Log In
            </Link>
          </p>
          <Link
            href="/forgot-password"
            className="text-sm text-center text-slate-500 hover:text-yellow-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </AuthForm>
    </div>
  );
}