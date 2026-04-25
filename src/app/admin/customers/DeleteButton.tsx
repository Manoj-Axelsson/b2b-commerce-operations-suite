// src/app/admin/customers/DeleteButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "./actions";

export function DeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    // 1. Confirm with the user
    if (!confirm("Är du säker på att du vill radera denna kund?")) return;

    setIsDeleting(true);
    try {
      await deleteCustomer(id);
      // revalidatePath marks the cache stale, but the UI won't update
      // until router.refresh() forces the server component to re-render.
      router.refresh();
    } catch (error) {
      console.error("Kunde inte radera:", error);
      alert("Något gick fel vid radering.");
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isDeleting}
      className={`font-medium transition-colors ${
        isDeleting ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:text-red-700"
      }`}
      onClick={handleDelete}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
