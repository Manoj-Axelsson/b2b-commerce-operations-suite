"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AuthForm } from "@/components/forms/AuthForm";
import { FormField } from "@/components/forms/FormField";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const isForgotPasswordFlow = !!token;

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (isForgotPasswordFlow) {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: form.newPassword,
        token,
      });

      if (resetError) {
        setError("Reset link is invalid or expired.");
        return;
      }
    } else {
      const { error: changeError } = await authClient.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      if (changeError) {
        setError("Failed to change password.");
        return;
      }
    }

    setMessage("Password changed successfully.");
    router.push("/login");
  };

  return (
    <AuthForm onSubmit={handleSubmit} submitLabel="Update password" error={error}>
      {!isForgotPasswordFlow && (
        <FormField
          label="Current Password"
          type="password"
          value={form.currentPassword}
          onChange={(value) => setForm({ ...form, currentPassword: value })}
          required
        />
      )}
      <FormField
        label="New Password"
        type="password"
        value={form.newPassword}
        onChange={(value) => setForm({ ...form, newPassword: value })}
        required
      />
      <FormField
        label="Confirm New Password"
        type="password"
        value={form.confirmPassword}
        onChange={(value) => setForm({ ...form, confirmPassword: value })}
        required
      />
      {message && <p>{message}</p>}
    </AuthForm>
  );
}