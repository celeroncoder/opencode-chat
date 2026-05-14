import type { Metadata } from "next";

import { HomePageClient } from "./home-page-client";

export const metadata: Metadata = {
  title: "New chat",
  description: "Start a new chat session.",
};

export default function Home() {
  return <HomePageClient />;
}
