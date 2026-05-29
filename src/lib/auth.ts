import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import prisma from "./prisma";
import { sendEmail } from "./mail";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  // Shown as the issuer label in Google Authenticator / Authy.
  appName: "Rajput Foods Sweden",

  secret: process.env.BETTER_AUTH_SECRET!,

  plugins: [
    twoFactor(),
  ],

  // role and isApproved are declared here so better-auth knows they exist
  // on the user model. input: false means the client CANNOT set these in
  // signUp.email() — role assignment is server-side only (admin/seed script).
  // This is how we prevent a new user from registering themselves as admin.
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      isApproved: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `<p><a href="${url}">Reset Password</a></p>`,
      });
    },
    onPasswordReset: async ({ user }) => {
      await sendEmail({
        to: user.email,
        subject: "Your password has been changed",
        html: `<p>Your password was successfully changed. If this wasn't you, please contact support.</p>`,
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your account",
        html: `<p><a href="${url}">Verify Email</a></p>`,
      });
    },
  },
});
