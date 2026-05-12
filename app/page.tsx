"use client";

import { createId } from "@paralleldrive/cuid2";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DEFAULT_MODEL_ID, models, type ModelId } from "@/lib/models";

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL_ID);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const id = createId();
    sessionStorage.setItem(`pending:${id}`, JSON.stringify({ text, model }));
    router.push(`/${id}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <select value={model} onChange={(e) => setModel(e.target.value as ModelId)}>
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        rows={4}
        autoFocus
      />
      <button type="submit">Send</button>
    </form>
  );
}
