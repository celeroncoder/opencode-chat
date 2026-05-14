import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to access your chat sessions.",
};

export default function Page() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <SignIn />
    </div>
  );
}
