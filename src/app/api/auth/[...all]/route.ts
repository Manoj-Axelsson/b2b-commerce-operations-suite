import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Catch-all route for better-auth.
// Handles all authentication flows: sign-in, sign-up, sign-out, sessions, etc.
// Routes: /api/auth/*
export const { GET, POST } = toNextJsHandler(auth);
