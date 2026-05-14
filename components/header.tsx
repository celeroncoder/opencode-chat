"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { MenuTwoLineIcon } from "@hugeicons/core-free-icons";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function useOptionalSidebar() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSidebar();
  } catch {
    return null;
  }
}

export function Header({ className }: { className?: string }) {
  const sidebar = useOptionalSidebar();
  const toggleSidebar = sidebar?.toggleSidebar;

  return (
    <header
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center gap-2 py-2 px-4 sm:p-4",
        className,
      )}
    >
      {toggleSidebar && (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="pointer-events-auto rounded-full border-2 border-border bg-muted/70 p-2 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={MenuTwoLineIcon} size={24} strokeWidth={2} />
        </button>
      )}
    </header>
  );
}
