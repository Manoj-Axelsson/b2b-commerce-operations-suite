import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seeding strategy:
 * - CSV-based ingestion
 * - Deterministic upsert per product (articleNo as unique key)
 * - Sequential execution by design
 *
 * Constraint:
 * - Maximum 200 rows can be processed in a single seed run to guarantee:
 *   No duplicates
 *   Safe incremental growth
 *
 * Philosophy:
 * - Fail fast on invalid data
 * - Keep logic simple and predictable
 *
 * Note:
 * - Image handling will be refactored when the image upload system is introduced 
 */

interface CsvRecord {
    product_name: string;
    brand: string;
    article_no: string;
    category: string;
    description: string;
    weight_value: string;
    unit: string;
    price_ore: string;
    current_stock: string;
    min_stock: string;
    expiry_date: string;
    image_path: string;
}

/**
 * Helpers
 */

function toInt(value: string, field: string, articleNo: string): number {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
        throw new Error(
            `Invalid number in field "${field}" for article ${articleNo}: "${value}"`
        );
    }

    return parsed;
}

function toDate(value: string, articleNo: string): Date {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
        throw new Error(
            `Invalid date for article ${articleNo}: "${value}"`
        );
    }

    return date;
}

async function main() {
    const csvFilePath = path.join(
        process.cwd(),
        'prisma/data/products_seed.csv'
    );

    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    }) as CsvRecord[];

    const MAX_ROWS = 200;

    if (records.length > MAX_ROWS) {
        throw new Error(
            `Seed limit exceeded: ${records.length} rows (max ${MAX_ROWS} allowed)`
        );
    }

    console.log(`--- Startar seeding av ${records.length} produkter ---`);

    let index = 0;

    for (const record of records) {
        index++;

        console.log(
            `Processing ${index}/${records.length}: ${record.product_name}`
        );

        await prisma.product.upsert({
            where: { articleNo: record.article_no },
            update: {}, // Do nothing if exists (idempotent)
            create: {
                name: record.product_name,
                brand: record.brand,
                articleNo: record.article_no,

                category: {
                    connectOrCreate: {
                        where: { name: record.category },
                        create: { name: record.category },
                    },
                },

                description: record.description,
                weightValue: toInt(record.weight_value, 'weight_value', record.article_no),
                weightUnit: record.unit,
                price: toInt(record.price_ore, 'price_ore', record.article_no),
                quantity: toInt(record.current_stock, 'current_stock', record.article_no),
                minQuantity: toInt(record.min_stock, 'min_stock', record.article_no),
                expiryDate: toDate(record.expiry_date, record.article_no),

                // TODO: Replace with Image relation when image upload system is implemented
                imageUrl: record.image_path,
            },
        });
    }

    console.log('--- Seeding slutförd! ---');
}

main()
    .catch((e) => {
        console.error('Fel vid seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });