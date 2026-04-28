import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting database seeding...");

    await prisma.product.upsert({
        where: { articleNo: "Atta - 001" },
        update: {
            imageUrl: "/Elephant Atta Medium 10kg.jpg",
            images: ["/Elephant Atta Medium 10kg.jpg"],
        },
        create: {
            articleNo: "Atta - 001",
            brand: "Elephant",
            name: "Elephant Atta Medium 10kg",
            description: "Elephant Atta Medium 10kg is a high-quality whole wheat flour perfect for making soft and fluffy rotis, chapatis, and naans. Made from the finest wheat grains, it ensures authentic taste and texture in every bite.",
            price: 14900,
            weightValue: 10,
            weightUnit: "kg",
            imageUrl: "/Elephant Atta Medium 10kg.jpg",
            images: ["/Elephant Atta Medium 10kg.jpg"],
            category: {
                connectOrCreate: {
                    where: { name: "Wheat & Flour" },
                    create: { name: "Wheat & Flour" },
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
    });

