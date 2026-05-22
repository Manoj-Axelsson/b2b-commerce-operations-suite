
import prisma  from "@/lib/prisma";

export const findActivePromotions = async (now: Date) => {
    // Ensure prisma is defined before calling findMany
    if (!prisma) {
        throw new Error("Prisma client is not initialized in promotion repository");
    }

    return prisma.promotion.findMany({
        where: {
            isActive: true,
            startDate: {lte: now},
            endDate: {gte: now},
        },
        select: {
            id: true,
            code: true,
            discountUnit: true,
            discountValue: true,
            products: {
                select: {
                    id: true,
                },
            },
        },
    });
};
