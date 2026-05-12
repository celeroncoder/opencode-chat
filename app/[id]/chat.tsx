"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_MODEL_ID, models, type ModelId } from "@/lib/models";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: UIMessage[];
}) {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL_ID);
  const modelRef = useRef(model);
  modelRef.current = model;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            sessionId: id,
            model: modelRef.current,
            message: messages[messages.length - 1],
          },
        }),
      }),
    [id],
  );

  const { messages, sendMessage, status } = useChat({
    id,
    transport,
    messages: initialMessages,
  });

  const sentInitialRef = useRef(false);
  useEffect(() => {
    if (sentInitialRef.current) return;
    const key = `pending:${id}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    sentInitialRef.current = true;
    sessionStorage.removeItem(key);
    try {
      const { text, model: initialModel } = JSON.parse(raw) as {
        text: string;
        model?: ModelId;
      };
      if (initialModel) setModel(initialModel);
      modelRef.current = initialModel ?? modelRef.current;
      sendMessage({ text });
    } catch {
      sendMessage({ text: raw });
    }
  }, [id, sendMessage]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  }

  const busy = status === "streaming" || status === "submitted";

  return (
    <div>
      <select
        value={model}
        onChange={(e) => setModel(e.target.value as ModelId)}
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <div>
        {messages.map((m) => (
          <div key={m.id}>
            <strong>{m.role}: </strong>
            {m.parts.map((p, i) => (
              <span key={i}>
                {p.type === "text"
                  ? p.text
                  : p.type === "reasoning"
                    ? p.text
                    : null}
              </span>
            ))}
          </div>
        ))}
        {status === "submitted" &&
        messages[messages.length - 1]?.role === "user" ? (
          <div>
            <strong>assistant: </strong>
            <span>…</span>
          </div>
        ) : null}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          disabled={busy}
        />
        <button type="submit" disabled={busy}>
          Send
        </button>
      </form>
      <div>status: {status}</div>
    </div>
  );
}
