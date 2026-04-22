"use client";

import { useTransition } from "react";
import { toggleProductVisibility } from "./actions";

interface Props {
  id: string;
  isActive: boolean;
}

export function ToggleVisibilityButton({ id, isActive }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => toggleProductVisibility(id, isActive));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isActive ? "Click to hide from shop" : "Click to show in shop"}
      className={`px-2 py-1 rounded text-[10px] font-bold transition-colors disabled:opacity-40 ${isActive
          ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
          : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
        }`}
    >
      {isPending ? "..." : isActive ? "Visible" : "Hidden"}
    </button>
  );
}
