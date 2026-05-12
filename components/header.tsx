"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { MenuTwoLineIcon } from "@hugeicons/core-free-icons";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function Header({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();

  return (
    <header
      className={cn("flex items-center gap-2 p-2 px-4 sm:p-4", className)}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
        className="px-2 py-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={MenuTwoLineIcon} size={24} strokeWidth={2} />
      </button>
    </header>
  );
}
