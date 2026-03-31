import type { User as PrismaUser, Session, Account } from "../../../generated/prisma/client";

export type User = PrismaUser;

export type UserWithRelations = PrismaUser & {
  sessions?: Session[];
  accounts?: Account[];
};
