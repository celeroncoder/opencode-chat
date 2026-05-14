"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChatAdd01Icon, Chat01Icon } from "@hugeicons/core-free-icons";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { NavUser } from "@/components/nav-user";

export function AppSidebar() {
  const params = useParams<{ id?: string }>();
  const activeId = params?.id;
  const { setOpenMobile, isMobile } = useSidebar();
  const trpc = useTRPC();

  const { data: sessions = [] } = useQuery({
    ...trpc.sessions.list.queryOptions(),
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <Button
          asChild
          className="w-full justify-start gap-2 text-base md:text-sm h-10 md:h-8"
          size="sm"
        >
          <Link href="/" onClick={closeOnMobile}>
            <HugeiconsIcon icon={ChatAdd01Icon} className="size-5 md:size-4" />
            New chat
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex-1 min-h-0">
          <SidebarGroupLabel className="text-sm md:text-xs">
            Chats
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-2">
              <SidebarMenu>
                {sessions.length === 0 ? (
                  <div className="px-2 py-4 text-sm md:text-xs text-muted-foreground">
                    No chats yet.
                  </div>
                ) : (
                  sessions.map((s) => (
                    <SidebarMenuItem key={s.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={s.id === activeId}
                        tooltip={s.title ?? "Untitled"}
                        className="h-10 md:h-8 text-base md:text-sm"
                      >
                        <Link href={`/${s.id}`} onClick={closeOnMobile}>
                          <HugeiconsIcon
                            icon={Chat01Icon}
                            className="size-5 md:size-4 shrink-0"
                          />
                          <span className="truncate">
                            {s.title ?? "Untitled"}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
