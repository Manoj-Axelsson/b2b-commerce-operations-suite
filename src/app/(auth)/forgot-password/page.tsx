
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
      <h1 className="text-xl font-bold text-center">Forgot Password</h1>
      <p className="text-sm text-center text-gray-500">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <FormField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />
      {message && <p className="text-sm text-green-700 text-center">{message}</p>}
      <div className="pt-2 border-t border-gray-100">
        <Link
          href="/login"
          className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-yellow-700 transition-colors"
        >
          <span aria-hidden="true">&larr;</span> Back to Log In
        </Link>
      </div>
    </AuthForm>
  );
}
