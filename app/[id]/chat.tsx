"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { SearchIcon, GlobeIcon, CheckIcon, LoaderIcon } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { useStickToBottomContext } from "use-stick-to-bottom";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { cn } from "@/lib/utils";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { PromptInput } from "@/components/prompt-input";
import { DEFAULT_MODEL_ID, type ModelId } from "@/lib/models";

type AnyPart = UIMessage["parts"][number] & Record<string, unknown>;

type ToolPart = {
  type: string;
  state?: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: unknown;
  output?: unknown;
};

function isToolPart(part: AnyPart): part is AnyPart & ToolPart {
  return typeof part.type === "string" && part.type.startsWith("tool-");
}

type SearchResultItem = { title?: string; url?: string };

function extractSearchResults(output: unknown): SearchResultItem[] {
  if (!output || typeof output !== "object") return [];
  const o = output as Record<string, unknown>;
  const candidates = (o.results ?? o.data ?? o.items ?? []) as unknown;
  if (!Array.isArray(candidates)) return [];
  return candidates.slice(0, 8).map((r) => {
    if (r && typeof r === "object") {
      const rec = r as Record<string, unknown>;
      return {
        title: (rec.title ?? rec.name ?? rec.url) as string | undefined,
        url: rec.url as string | undefined,
      };
    }
    return { title: String(r) };
  });
}

function ScrollFades() {
  const { scrollRef, isAtBottom } = useStickToBottomContext();
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setAtTop(el.scrollTop <= 1);
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-20 h-8 backdrop-blur-md transition-opacity duration-200",
          "[mask-image:linear-gradient(to_bottom,black,transparent)]",
          atTop ? "opacity-0" : "opacity-100",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-20 h-8 backdrop-blur-md transition-opacity duration-200",
          "[mask-image:linear-gradient(to_top,black,transparent)]",
          isAtBottom ? "opacity-0" : "opacity-100",
        )}
      />
    </>
  );
}

function ToolStep({ part }: { part: AnyPart & ToolPart }) {
  const name = part.type.slice("tool-".length);
  const isRunning =
    part.state === "input-streaming" || part.state === "input-available";
  const isError = part.state === "output-error";
  const status: "complete" | "active" | "pending" = isRunning
    ? "active"
    : "complete";

  if (name === "search") {
    const query = (part.input as { query?: string } | undefined)?.query;
    const results = extractSearchResults(part.output);
    return (
      <ChainOfThoughtStep
        icon={isRunning ? LoaderIcon : isError ? SearchIcon : CheckIcon}
        label={
          isRunning ? (
            <Shimmer duration={1.5}>{`Searching${query ? ` for "${query}"` : "…"}`}</Shimmer>
          ) : (
            <span>
              Searched the web
              {query ? (
                <span className="text-muted-foreground"> · {query}</span>
              ) : null}
            </span>
          )
        }
        status={status}
      >
        {results.length > 0 ? (
          <ChainOfThoughtSearchResults>
            {results.map((r, i) => (
              <ChainOfThoughtSearchResult key={i}>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate max-w-[18rem]"
                  >
                    {r.title || r.url}
                  </a>
                ) : (
                  <span className="truncate max-w-[18rem]">{r.title}</span>
                )}
              </ChainOfThoughtSearchResult>
            ))}
          </ChainOfThoughtSearchResults>
        ) : null}
      </ChainOfThoughtStep>
    );
  }

  if (name === "scrape") {
    const urls = (part.input as { urls?: string[] } | undefined)?.urls ?? [];
    return (
      <ChainOfThoughtStep
        icon={isRunning ? LoaderIcon : GlobeIcon}
        label={
          isRunning ? (
            <Shimmer duration={1.5}>{`Reading ${urls.length || ""} page${urls.length === 1 ? "" : "s"}…`}</Shimmer>
          ) : (
            <span>
              Read {urls.length} page{urls.length === 1 ? "" : "s"}
            </span>
          )
        }
        status={status}
      >
        {urls.length > 0 ? (
          <ChainOfThoughtSearchResults>
            {urls.slice(0, 6).map((u, i) => {
              let label = u;
              try {
                label = new URL(u).hostname.replace(/^www\./, "");
              } catch {}
              return (
                <ChainOfThoughtSearchResult key={i}>
                  <a
                    href={u}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate max-w-[18rem]"
                  >
                    {label}
                  </a>
                </ChainOfThoughtSearchResult>
              );
            })}
          </ChainOfThoughtSearchResults>
        ) : null}
      </ChainOfThoughtStep>
    );
  }

  return (
    <ChainOfThoughtStep
      icon={isRunning ? LoaderIcon : CheckIcon}
      label={isRunning ? <Shimmer duration={1.5}>{`${name}…`}</Shimmer> : name}
      status={status}
    />
  );
}

type Group =
  | { kind: "reasoning"; parts: (AnyPart & { text: string })[] }
  | { kind: "tools"; parts: (AnyPart & ToolPart)[] }
  | { kind: "text"; parts: (AnyPart & { text: string })[] };

function groupParts(parts: AnyPart[]): Group[] {
  const groups: Group[] = [];
  for (const p of parts) {
    if (p.type === "reasoning") {
      const last = groups.at(-1);
      if (last?.kind === "reasoning") last.parts.push(p as never);
      else groups.push({ kind: "reasoning", parts: [p as never] });
    } else if (isToolPart(p)) {
      const last = groups.at(-1);
      if (last?.kind === "tools") last.parts.push(p);
      else groups.push({ kind: "tools", parts: [p] });
    } else if (p.type === "text") {
      const last = groups.at(-1);
      if (last?.kind === "text") last.parts.push(p as never);
      else groups.push({ kind: "text", parts: [p as never] });
    }
  }
  return groups;
}

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

  const busy = status === "streaming" || status === "submitted";
  const lastMessage = messages.at(-1);
  const showAssistantPlaceholder =
    status === "submitted" && lastMessage?.role === "user";

  return (
    <div className="relative h-full min-h-0">
      <Conversation className="absolute inset-0">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 pt-20 pb-40">
          {messages.length === 0 && !showAssistantPlaceholder ? (
            <ConversationEmptyState
              title="Start the conversation"
              description="Ask anything — I can search the web and read pages."
            />
          ) : (
            messages.map((m, mi) => {
              const isLast = mi === messages.length - 1;
              const groups = groupParts(m.parts as AnyPart[]);
              return (
                <Message from={m.role} key={m.id}>
                  <MessageContent>
                    {groups.map((g, gi) => {
                      if (g.kind === "reasoning") {
                        const text = g.parts.map((p) => p.text).join("\n");
                        const isReasoningStreaming =
                          isLast &&
                          status === "streaming" &&
                          gi === groups.length - 1;
                        return (
                          <Reasoning
                            key={gi}
                            isStreaming={isReasoningStreaming}
                            defaultOpen={isReasoningStreaming}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{text}</ReasoningContent>
                          </Reasoning>
                        );
                      }
                      if (g.kind === "tools") {
                        const anyRunning = g.parts.some(
                          (p) =>
                            p.state === "input-streaming" ||
                            p.state === "input-available",
                        );
                        return (
                          <ChainOfThought key={gi} defaultOpen={anyRunning}>
                            <ChainOfThoughtHeader>
                              {anyRunning ? (
                                <Shimmer duration={1.5}>{`Working through ${g.parts.length} step${g.parts.length === 1 ? "" : "s"}`}</Shimmer>
                              ) : (
                                <>
                                  Used {g.parts.length} tool
                                  {g.parts.length === 1 ? "" : "s"}
                                </>
                              )}
                            </ChainOfThoughtHeader>
                            <ChainOfThoughtContent>
                              {g.parts.map((p, pi) => (
                                <ToolStep key={pi} part={p} />
                              ))}
                            </ChainOfThoughtContent>
                          </ChainOfThought>
                        );
                      }
                      return (
                        <Fragment key={gi}>
                          {g.parts.map((p, pi) => (
                            <MessageResponse key={pi}>{p.text}</MessageResponse>
                          ))}
                        </Fragment>
                      );
                    })}
                  </MessageContent>
                </Message>
              );
            })
          )}
          {showAssistantPlaceholder ? (
            <Message from="assistant">
              <MessageContent>
                <Shimmer duration={1.5}>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          ) : null}
        </ConversationContent>
        <ScrollFades />
        <ConversationScrollButton className="bottom-32" />
      </Conversation>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 mx-auto w-full max-w-3xl px-4 pb-4 *:pointer-events-auto">
        <PromptInput
          value={input}
          onValueChange={setInput}
          onSubmit={() => {
            const text = input.trim();
            if (!text) return;
            sendMessage({ text });
            setInput("");
          }}
          model={model}
          onModelChange={setModel}
          busy={busy}
        />
      </div>
    </div>
  );
}
