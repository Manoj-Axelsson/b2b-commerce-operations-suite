import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    twoFactorClient({
      // When a login requires a TOTP code, Better Auth redirects here.
      twoFactorPage: "/two-factor",
    }),
  ],
  user: {
    additionalFields: {
      role: { type: "string" },
      isApproved: { type: "boolean" },
    }
  }
});
