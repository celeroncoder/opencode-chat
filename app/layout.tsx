import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { Geist, Geist_Mono, Oxanium, Figtree } from "next/font/google";
import { ClerkProvider, Show } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarSwipeHandler } from "@/components/sidebar-swipe-handler";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/client";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

const figtreeHeading = Figtree({
  subsets: ["latin"],
  variable: "--font-heading",
});
const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Opencode Chat";
const APP_DESCRIPTION = "Opencode chat application";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `
(() => {
  try {
    const theme = localStorage.getItem("theme") || "system";
    const resolvedTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
  } catch {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  if (userId) {
    prefetch(trpc.sessions.list.queryOptions());
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        oxanium.variable,
        figtreeHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ServiceWorkerRegister />
        <ClerkProvider>
          <TRPCReactProvider>
            <HydrateClient>
              <ThemeProvider
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <TooltipProvider>
                  <Show when="signed-out">
                    {children}
                  </Show>
                  <Show when="signed-in">
                    <SidebarProvider>
                      <SidebarSwipeHandler />
                      <AppSidebar />
                      <SidebarInset>
                        <div className="flex-1 flex flex-col min-h-0">
                          {children}
                        </div>
                      </SidebarInset>
                    </SidebarProvider>
                  </Show>
                </TooltipProvider>
              </ThemeProvider>
            </HydrateClient>
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
