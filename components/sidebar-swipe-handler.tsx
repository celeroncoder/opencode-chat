"use client";

import { useEffect, useRef } from "react";
import { useSidebar } from "@/components/ui/sidebar";

const SWIPE_THRESHOLD = 50;
const EDGE_ZONE = 30; // px from left edge to trigger open

export function SidebarSwipeHandler() {
  const { setOpenMobile, isMobile, openMobile } = useSidebar();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!isMobile) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;

      // Ignore mostly-vertical swipes
      if (Math.abs(dy) > Math.abs(dx)) return;

      if (dx > SWIPE_THRESHOLD && touchStartX.current < EDGE_ZONE) {
        setOpenMobile(true);
      } else if (dx < -SWIPE_THRESHOLD && openMobile) {
        setOpenMobile(false);
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isMobile, openMobile, setOpenMobile]);

  return null;
}
