"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";

// Client Component — authClient.signOut() is a browser-side operation.
// Full page reload ensures all server-rendered auth state is re-evaluated.
export function LogoutButton() {
  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}
