"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { error } = await authClient.twoFactor.verifyTotp({
      code,
      trustDevice,
    });

    if (error) {
      setError("Invalid code. Please check your authenticator app and try again.");
      setIsSubmitting(false);
      return;
    }

    // Fetch user role to decide where to redirect after 2FA passes.
    const res = await fetch("/api/user");
    const user = await res.json();

    if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/shop");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* subpixel-antialiased sharpens Garamond strokes; slate-200 border for crisper card edge */}
      <div className="w-full max-w-sm space-y-6 p-8 rounded-2xl border border-slate-200 bg-white shadow-sm subpixel-antialiased">
        <div className="space-y-1 text-center">
          {/* text-2xl + font-semibold + text-slate-950 — consistent with other auth headings */}
          <h1 className="text-2xl font-semibold text-slate-950">Two-Factor Authentication</h1>
          {/* text-base (up from text-sm) + text-slate-700 (up from text-slate-500) */}
          <p className="text-base text-slate-700">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            id="totp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
            // text-2xl + tracking-widest kept for TOTP UX; border upgraded to slate for contrast
            className="w-full text-center text-2xl tracking-widest border border-slate-400 rounded-lg px-4 py-3 text-slate-950 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          {/* text-base (up from text-sm) + text-slate-800 (up from text-slate-600) + font-medium */}
          <label className="flex items-center gap-2 text-base font-medium text-slate-800 cursor-pointer">
            <input
              id="trust-device"
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="rounded border-slate-400"
            />
            Trust this device for 30 days
          </label>

          {error && (
            // text-base (up from text-sm) + text-red-700 for high-contrast error
            <p className="text-base font-medium text-red-700 text-center">{error}</p>
          )}

          <button
            id="verify-totp-btn"
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-2 rounded-lg transition-colors"
          >
            {isSubmitting ? "Verifying…" : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
