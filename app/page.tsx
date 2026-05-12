"use client";

import { createId } from "@paralleldrive/cuid2";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PromptInput } from "@/components/prompt-input";
import { DEFAULT_MODEL_ID, type ModelId } from "@/lib/models";

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL_ID);

  function submit() {
    const text = input.trim();
    if (!text) return;
    const id = createId();
    sessionStorage.setItem(`pending:${id}`, JSON.stringify({ text, model }));
    router.push(`/${id}`);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-2xl flex-col items-center justify-center gap-8 px-4">
      <PromptInput
        autoFocus
        value={input}
        onValueChange={setInput}
        onSubmit={submit}
        model={model}
        onModelChange={setModel}
      />
    </div>
  );
}
