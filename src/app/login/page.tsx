//src/app/login/page.tsx

"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await authClient.signIn.email({
      email,
      password,
    }, {
      onSuccess: () => router.push("/admin/inventory"),
      onError: (ctx) => alert(ctx.error.message),
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="p-8 border rounded-xl shadow-sm w-full max-w-md bg-white">
        <h1 className="text-2xl font-bold mb-6">Admin Log in</h1>
        <input className="w-full p-2 border mb-4 rounded" type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input className="w-full p-2 border mb-4 rounded" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-red-600 text-white py-2 rounded font-bold">Log in</button>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <Link href="/signup" 
            className="text-sm text-gray-600 hover:text-red-600 hover:underline transition-all"
          >
            Create Admin Account
          </Link>
        </div>
      </form>
    </div>
  );
}







/*

"use client";

import { loginAsAdmin } from "./actions";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-xl rounded-2xl border w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-2">Rajput Admin</h1>
        <p className="text-gray-500 mb-8">Klicka nedan för att logga in direkt</p>
        
        <button 
          onClick={async () => {
            setLoading(true);
            await loginAsAdmin();
          }}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? "Loggar in..." : "🚀 Logga in som Admin"}
        </button>
        
        <p className="mt-4 text-xs text-gray-400">
          Använder admin-id: admin-user-1 från databasen.
        </p>
      </div>
    </div>
  );
}

*/
