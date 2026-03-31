import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}

const pool = new pg.Pool({ connectionString });

const adapter = new PrismaPg(pool as any);

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting database seeding...");

    await prisma.product.upsert({
        where: { articleNo: "DEFAULT-001" },
        update: {},
        create: {
            articleNo: "DEFAULT-001",
            brand: "Rajput Foods",
            name: "Classic Basmati Rice",
            description: "Premium long-grain aromatic rice.",
            price: 24900,
            weightValue: 5,
            weightUnit: "kg",
            imageUrl: "/images/products/basmati.jpg",
            category: {
                connectOrCreate: {
                    where: { name: "Rice & Grains" },
                    create: { name: "Rice & Grains" },
                },
            },
            quantity: 50,
        },
    });

    console.log("Seeding completed successfully.");
}

main()
    .catch((e) => {
        console.error("Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
