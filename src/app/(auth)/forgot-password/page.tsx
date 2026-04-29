
"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { AuthForm } from "@/components/forms/AuthForm";
import { FormField } from "@/components/forms/FormField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error: requestError } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (requestError) {
      setError("Could not send reset email. Please check your email and try again.");
      return;
    }

    setMessage("Reset link sent. Please check your email.");
  };

  return (
    <AuthForm onSubmit={handleSubmit} submitLabel="Send Reset Link" error={error}>
      {/* text-2xl + font-semibold + text-slate-950 — consistent with other auth headings */}
      <h1 className="text-2xl font-semibold text-slate-950 text-center">Forgot Password</h1>
      {/* text-base (up from text-sm) + text-slate-700 (up from text-gray-500) */}
      <p className="text-base text-center text-slate-700">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <FormField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />
      {/* text-base (up from text-sm) + text-green-700 for high-contrast success state */}
      {message && <p className="text-base font-medium text-green-700 text-center">{message}</p>}
      <div className="pt-2 border-t border-slate-200">
        {/* text-base (up from text-sm) + text-slate-600 for clear back link */}
        <Link
          href="/login"
          className="flex items-center justify-center gap-1 text-base text-slate-600 hover:text-yellow-700 transition-colors"
        >
          <span aria-hidden="true">&larr;</span> Back to Log In
        </Link>
      </div>
    </AuthForm>
  );
}
