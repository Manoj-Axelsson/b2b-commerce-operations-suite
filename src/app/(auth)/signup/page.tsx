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
      <AuthForm onSubmit={handleSubmit} submitLabel="Create account" error={error}>
        <h1 className="text-xl font-bold text-center">Sign Up</h1>

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

        {success && <p className="text-green-600 text-sm text-center">{success}</p>}

        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 mt-4">
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-yellow-700 font-bold hover:underline">
              Login
            </Link>
          </p>
          <Link
            href="/forgot-password"
            className="text-xs text-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </AuthForm>
    </div>
  );
}