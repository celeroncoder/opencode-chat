"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDataTransferVerticalIcon,
  Logout03Icon,
  Moon02Icon,
  Sun03Icon,
  UserSettings01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { useRef } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ResponsiveDropdownMenu,
  ResponsiveDropdownMenuContent,
  ResponsiveDropdownMenuItem,
  ResponsiveDropdownMenuLabel,
  ResponsiveDropdownMenuSeparator,
  ResponsiveDropdownMenuTrigger,
} from "@/components/ui/responsive-dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { resolvedTheme, setTheme } = useTheme();
  const themeItemRef = useRef<HTMLDivElement>(null);

  const isDark = resolvedTheme === "dark";

  const toggleTheme = async () => {
    const next = isDark ? "light" : "dark";
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    if (!doc.startViewTransition || !themeItemRef.current) {
      setTheme(next);
      return;
    }

    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });

    await transition.ready;

    const { top, left, width, height } =
      themeItemRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top),
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 600,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  const fullName = user?.fullName ?? "Account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials =
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "") || "U";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ResponsiveDropdownMenu>
          <ResponsiveDropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.imageUrl} alt={fullName} />
                <AvatarFallback className="rounded-lg">
                  {initials.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-base md:text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                <span className="truncate text-sm md:text-xs text-muted-foreground">
                  {email}
                </span>
              </div>
              <HugeiconsIcon
                icon={ArrowDataTransferVerticalIcon}
                className="ml-auto size-5 md:size-4"
              />
            </SidebarMenuButton>
          </ResponsiveDropdownMenuTrigger>
          <ResponsiveDropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            title={fullName}
            description={email}
          >
            <ResponsiveDropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.imageUrl} alt={fullName} />
                  <AvatarFallback className="rounded-lg">
                    {initials.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </ResponsiveDropdownMenuLabel>
            <ResponsiveDropdownMenuSeparator />
            <ResponsiveDropdownMenuItem asChild>
              <Link href="/user-profile">
                <HugeiconsIcon icon={UserSettings01Icon} className="size-4" />
                Account
              </Link>
            </ResponsiveDropdownMenuItem>
            <ResponsiveDropdownMenuItem
              ref={themeItemRef}
              onClick={toggleTheme}
            >
              <HugeiconsIcon
                icon={isDark ? Sun03Icon : Moon02Icon}
                className="size-4"
              />
              {isDark ? "Light mode" : "Dark mode"}
            </ResponsiveDropdownMenuItem>
            <ResponsiveDropdownMenuSeparator />
            <ResponsiveDropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <HugeiconsIcon icon={Logout03Icon} className="size-4" />
              Log out
            </ResponsiveDropdownMenuItem>
          </ResponsiveDropdownMenuContent>
        </ResponsiveDropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
