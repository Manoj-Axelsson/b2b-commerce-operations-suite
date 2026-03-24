import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();


    const riceCategory = await prisma.category.create({
        data: { name: "Rice & Grains" }
    });

    const spicesCategory = await prisma.category.create({
        data: { name: "Spices & Herbs" }
    });

    const products = [
        {
            name: "Premium Basmati Rice",
            brand: "Rajput Heritage",
            description: "Aged for 2 years, our long-grain Basmati rice offers an unmatched aroma and fluffy texture, perfect for royal biryanis.",
            price: 24900, // 249.00 SEK in öre
            discountPrice: 19900, // 199.00 SEK in öre
            quantity: 50,
            weightValue: 5,
            weightUnit: "kg",
            articleNo: "RF-RICE-001",
            categoryId: riceCategory.id,
            images: [
                "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1590130331182-950bd367c29c?auto=format&fit=crop&q=80&w=800"
            ]
        },
        {
            name: "Organic Turmeric Powder",
            brand: "Rajput Spice",
            description: "Hand-picked and stone-ground to preserve essential oils and vibrant color. High curcumin content.",
            price: 8900, // 89.00 SEK in öre
            quantity: 0, // Testing "Out of Stock" state
            weightValue: 250,
            weightUnit: "g",
            articleNo: "RF-SPICE-002",
            categoryId: spicesCategory.id,
            images: ["https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&q=80&w=800"]
        }
    ];

    for (const product of products) {
        await prisma.product.create({ data: product });
    }

    console.log("Seed successful: Rajput Foods catalog updated.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
