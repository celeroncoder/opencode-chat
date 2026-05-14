"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Header } from "@/components/header";
import { PromptInput } from "@/components/prompt-input";
import { DEFAULT_MODEL_ID, type ModelId } from "@/lib/models";
import { createId } from "@paralleldrive/cuid2";
import { createChat } from "@/lib/chat/actions";

export function HomePageClient() {
  const { push } = useRouter();
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL_ID);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const text = input.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const messageId = createId();
      const { id } = await createChat(model);
      sessionStorage.setItem(`pending:${id}`, JSON.stringify({ text, model, messageId }));
      push(`/${id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <div className="mx-auto flex min-h-[calc(100vh-16px)] w-full max-w-2xl flex-col items-center justify-end gap-8 px-4 pb-2">
        <PromptInput
          value={input}
          onValueChange={setInput}
          onSubmit={submit}
          model={model}
          onModelChange={setModel}
          busy={submitting}
        />
      </div>
    </>
  );
}
