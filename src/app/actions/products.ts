'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateProductStock(productId: string, change: number) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        // Prisma sköter matematiken åt oss: quantity + change
        quantity: {
          increment: change,
        },
      },
    })

    // Rensar cachen för admin-vyn så att det nya saldot syns direkt
    revalidatePath("/admin")
    
    return { success: true }
  } catch (error) {
    console.error("Misslyckades att uppdatera saldo:", error)
    return { success: false, error: "Kunde inte uppdatera saldot." }
  }
}