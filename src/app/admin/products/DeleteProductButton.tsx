"use client";

import { useTransition } from "react";
import { deleteProduct } from "./actions";

interface Props {
  id: string;
  hasOrders: boolean;
}

export function DeleteProductButton({ id, hasOrders }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const message = hasOrders
      ? "This product has order history. It will be hidden from the shop but not permanently deleted. Continue?"
      : "Are you sure you want to permanently delete this product?";

    if (!confirm(message)) return;

    startTransition(() => deleteProduct(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-red-600 hover:underline disabled:opacity-40 font-bold"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
