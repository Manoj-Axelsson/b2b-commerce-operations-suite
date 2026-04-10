// src/app/signup/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    
    await authClient.signUp.email({
      email,
      password,
      name,
      role: "ADMIN", 
    } as unknown as { email: string; password: string; name: string; role: string }, {
      onSuccess: () => {
        setShowToast(true);
        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 2000);
      },
      onError: (ctx) => {
        setLoading(false);
        alert(ctx.error.message);
      },
    });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 md:p-6">
      {showToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-lg border-2 border-green-200 bg-green-500 px-6 py-4 text-white shadow-2xl animate-in fade-in slide-in-from-top-4">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-bold leading-none">Success!</p>
            <p className="mt-1 text-sm opacity-90">Account created. Redirecting...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md border bg-white p-8 shadow-sm rounded-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">Create Admin Account</h1>
        <p className="mb-8 text-center text-sm text-slate-500">Register a new administrator</p>
        
        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="space-y-1.5">
            <label className="ml-1 text-sm font-semibold text-slate-700">Full Name</label>
            <input 
              className="w-full rounded-lg border border-slate-200 p-3 outline-none transition-all focus:ring-2 focus:ring-blue-500" 
              placeholder="John Doe" 
              required
              onChange={e => setName(e.target.value)} 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="ml-1 text-sm font-semibold text-slate-700">Email Address</label>
            <input 
              className="w-full rounded-lg border border-slate-200 p-3 outline-none transition-all focus:ring-2 focus:ring-blue-500" 
              type="email" 
              placeholder="admin@example.com" 
              required
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-sm font-semibold text-slate-700">Password</label>
            <input 
              className="w-full rounded-lg border border-slate-200 p-3 outline-none transition-all focus:ring-2 focus:ring-blue-500" 
              type="password" 
              placeholder="••••••••" 
              required
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit"
            disabled={loading || showToast}
            className={`w-full py-3.5 rounded-lg font-bold text-white transition-all shadow-md ${
              loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Register Admin"}
          </button>
        </form>
      </div>
    </main>
  );
}

