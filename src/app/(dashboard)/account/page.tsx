"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";

type User = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role?: string | null;
  isApproved?: boolean;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch("/api/user");
      if (!res.ok) {
        router.push("/user-login");
        return;
      }

      const userData = await res.json();
      setUser(userData);
      setLoading(false);
    };

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/user-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>User not found. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">My Account</h1>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3 text-sm text-slate-700">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>
            <p><strong>Admin Approved:</strong> {user.isApproved ? "Yes" : "Pending admin approval"}</p>
          </div>
        </div>

        {!user.isApproved && (
          <div className="p-4 bg-yellow-100 text-yellow-800 text-sm rounded">
            Your account is awaiting admin approval. You can browse, but cannot place orders yet.
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </div>
  );
}

