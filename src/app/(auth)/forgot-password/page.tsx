
"use client";

import { useState } from "react";
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
      <FormField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />
      {message && <p className="text-sm text-green-700">{message}</p>}
    </AuthForm>
  );
}
