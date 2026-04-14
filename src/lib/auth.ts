import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { sendEmail } from "./mail";
import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  secret: process.env.BETTER_AUTH_SECRET!,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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
    sendOnSignIn: true,
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        const session = ctx.context.newSession;

        if (session?.user) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              isApproved: false,
            },
          });
        }
      }
    }),
  },
});
