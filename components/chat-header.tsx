"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  MenuTwoLineIcon,
} from "@hugeicons/core-free-icons";

import { useSidebar } from "@/components/ui/sidebar";
import {
  ResponsiveDropdownMenu,
  ResponsiveDropdownMenuContent,
  ResponsiveDropdownMenuItem,
  ResponsiveDropdownMenuTrigger,
} from "@/components/ui/responsive-dropdown-menu";
import { cn } from "@/lib/utils";

export function ChatHeader({
  sessionId,
  className,
}: {
  sessionId: string;
  className?: string;
}) {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  async function handleDelete() {
    if (!confirm("Delete this chat? This cannot be undone.")) return;
    const res = await fetch(`/api/chat/sessions/${sessionId}`, {
      method: "DELETE",
    });
    if (res.ok || res.status === 404) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <header
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between py-2 px-4 sm:p-4",
        className,
      )}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
        className="pointer-events-auto px-2 py-2 text-muted-foreground transition-colors hover:text-foreground bg-muted/70 p-1 backdrop-blur-sm rounded-full border-2 border-border"
      >
        <HugeiconsIcon icon={MenuTwoLineIcon} size={24} strokeWidth={2} />
      </button>

      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-muted/70 p-1 backdrop-blur-sm border-2">
        <ResponsiveDropdownMenu>
          <ResponsiveDropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Chat options"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
            >
              <HugeiconsIcon
                icon={MoreHorizontalIcon}
                size={20}
                strokeWidth={2}
              />
            </button>
          </ResponsiveDropdownMenuTrigger>
          <ResponsiveDropdownMenuContent align="end" title="Chat options">
            <ResponsiveDropdownMenuItem
              onClick={handleDelete}
              variant="destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
              Delete session
            </ResponsiveDropdownMenuItem>
          </ResponsiveDropdownMenuContent>
        </ResponsiveDropdownMenu>
        <Link
          href="/"
          aria-label="New chat"
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={20} strokeWidth={2} />
        </Link>
      </div>
    </header>
  );
}
