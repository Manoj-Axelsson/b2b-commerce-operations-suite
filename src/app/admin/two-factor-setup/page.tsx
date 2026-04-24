"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

type SetupData = {
  totpURI: string;  // The otpauth:// URI — used to generate a QR code image
  backupCodes: string[];
};

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [backupCodesVisible, setBackupCodesVisible] = useState(false);

  // Step 1 — Request the TOTP secret and QR code from Better Auth.
  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { data, error } = await authClient.twoFactor.enable({
      password,
      issuer: "Rajput Foods Sweden",
    });

    if (error || !data) {
      setError("Could not start 2FA setup. Check your password and try again.");
      setIsLoading(false);
      return;
    }

    setSetupData(data as unknown as SetupData);
    setIsLoading(false);
  };

  // Step 2 — Verify the first TOTP code to confirm the app is configured correctly.
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    const { error } = await authClient.twoFactor.verifyTotp({
      code: verifyCode,
    });

    if (error) {
      setError("Code is incorrect. Make sure the code matches your authenticator app.");
      setIsVerifying(false);
      return;
    }

    // 2FA is now fully active. Show backup codes, then redirect to admin.
    setBackupCodesVisible(true);
    setIsVerifying(false);
  };

  // The QR code is generated from the totpURI via a public API — no secrets sent externally.
  const qrCodeUrl = setupData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.totpURI)}`
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 p-8 rounded-2xl border border-yellow-200 bg-white shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">Set Up Two-Factor Authentication</h1>
          <p className="text-sm text-slate-500">
            Adds a second layer of security to your admin account.
            You only need to do this once.
          </p>
        </div>

        {/* Step 1 — Enter password to get the QR code */}
        {!setupData && (
          <form onSubmit={handleEnable} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="admin-password" className="text-sm font-medium text-slate-700">
                Confirm your password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Your current password"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              id="start-2fa-setup-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold py-2 rounded-lg transition-colors"
            >
              {isLoading ? "Loading…" : "Get QR Code"}
            </button>
          </form>
        )}

        {/* Step 2 — Scan the QR code and verify the first code */}
        {setupData && !backupCodesVisible && (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                1. Open Google Authenticator or Authy and scan this QR code:
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <Image
                    src={qrCodeUrl}
                    alt="2FA QR Code — scan with your authenticator app"
                    width={200}
                    height={200}
                    className="rounded-lg border border-slate-200"
                    unoptimized
                  />
                </div>
              )}
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">
                  2. Enter the 6-digit code from the app to confirm:
                </p>
                <input
                  id="verify-setup-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  required
                  className="w-full text-center text-2xl tracking-widest border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                id="confirm-2fa-setup-btn"
                type="submit"
                disabled={isVerifying || verifyCode.length !== 6}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold py-2 rounded-lg transition-colors"
              >
                {isVerifying ? "Confirming…" : "Activate 2FA"}
              </button>
            </form>
          </div>
        )}

        {/* Step 3 — Show backup codes. User MUST save these. */}
        {backupCodesVisible && setupData && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800">
                ✅ Two-factor authentication is now active!
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Save these backup codes in a safe place.
                Each code can only be used once if you lose access to your authenticator app.
              </p>
              <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-sm">
                {setupData.backupCodes.map((code) => (
                  <span key={code} className="text-slate-700">{code}</span>
                ))}
              </div>
            </div>

            <button
              id="finish-2fa-setup-btn"
              onClick={() => router.push("/admin")}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition-colors"
            >
              Done — Go to Admin Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
