import { PrismaClient } from '../generated/prisma';
import { prismaConfig } from '../../prisma.config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

const pool = new pg.Pool({ connectionString: prismaConfig.url });
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;