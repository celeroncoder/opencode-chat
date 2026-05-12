"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDataTransferVerticalIcon,
  Logout03Icon,
  UserSettings01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

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
