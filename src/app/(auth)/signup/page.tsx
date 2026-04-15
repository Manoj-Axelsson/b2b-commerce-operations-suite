"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

    setSuccess("Verification email sent. Please check your inbox.");
    router.push("/login");
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
      </AuthForm>
    </div>
  );
}