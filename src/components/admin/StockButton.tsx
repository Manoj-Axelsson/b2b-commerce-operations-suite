// /components/admin/StockButton.tsx

'use client' // <--- Måste ligga allra högst upp!

import { useTransition } from 'react'
import { updateProductStock } from '@/app/actions/products'

interface StockButtonProps {
  productId: string
  currentStock: number
}

export function StockButton({ productId, currentStock }: StockButtonProps) {
  // Här placeras useTransition
  const [isPending, startTransition] = useTransition()

  const handleUpdate = (change: number) => {
    if (currentStock + change < 0) return

    // Här startas transitionen som anropar din Server Action
    startTransition(async () => {
      await updateProductStock(productId, change)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleUpdate(-1)}
        disabled={isPending || currentStock <= 0}
        className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 rounded-full disabled:opacity-30 transition-all font-bold"
      >
        -
      </button>
      
      <span className={`w-6 text-center font-mono font-bold ${isPending ? 'animate-pulse text-gray-400' : ''}`}>
        {currentStock}
      </span>

      <button
        onClick={() => handleUpdate(1)}
        disabled={isPending}
        className="w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 rounded-full disabled:opacity-30 transition-all font-bold"
      >
        +
      </button>
    </div>
  )
}