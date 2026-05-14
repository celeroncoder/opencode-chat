"use client";

import { ArrowUp02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  ResponsiveSelect,
  ResponsiveSelectContent,
  ResponsiveSelectGroup,
  ResponsiveSelectItem,
  ResponsiveSelectLabel,
  ResponsiveSelectTrigger,
  ResponsiveSelectValue,
} from "@/components/ui/responsive-select";
import { models, type ModelEntry, type ModelId } from "@/lib/models";
import { cn } from "@/lib/utils";

const providerLabels: Record<ModelEntry["provider"], string> = {
  "openai-compatible": "OpenAI Compatible",
  anthropic: "Anthropic",
  alibaba: "Alibaba",
};

const groupedModels = models.reduce<Record<string, ModelEntry[]>>((acc, m) => {
  (acc[m.provider] ??= []).push(m);
  return acc;
}, {});

export interface PromptInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  busy?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function PromptInput({
  value,
  onValueChange,
  onSubmit,
  model,
  onModelChange,
  busy = false,
  disabled = false,
  placeholder = "Ask anything…",
  className,
}: PromptInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.cssText = `height:auto;height:${Math.min(el.scrollHeight, 200)}px;`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (value.trim() && !busy && !disabled) onSubmit();
    }
  }

  const canSubmit = value.trim().length > 0 && !busy && !disabled;

  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-2xl border border-border bg-background shadow-sm focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
          className="block w-full resize-none rounded-t-2xl bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <ResponsiveSelect
            value={model}
            onValueChange={(v) => onModelChange(v as ModelId)}
            disabled={disabled}
          >
            <ResponsiveSelectTrigger
              size="sm"
              className="h-7 border-0 bg-transparent px-2 text-xs shadow-none hover:bg-muted focus-visible:ring-0"
            >
              <ResponsiveSelectValue placeholder="Model" />
            </ResponsiveSelectTrigger>
            <ResponsiveSelectContent align="start" title="Select model">
              {Object.entries(groupedModels).map(([provider, items]) => (
                <ResponsiveSelectGroup key={provider}>
                  <ResponsiveSelectLabel>
                    {providerLabels[provider as ModelEntry["provider"]]}
                  </ResponsiveSelectLabel>
                  {items.map((m) => (
                    <ResponsiveSelectItem key={m.id} value={m.id}>
                      {m.name}
                    </ResponsiveSelectItem>
                  ))}
                </ResponsiveSelectGroup>
              ))}
            </ResponsiveSelectContent>
          </ResponsiveSelect>
          <Button
            type="button"
            size="icon"
            disabled={!canSubmit}
            className="size-7 rounded-full"
            aria-label="Send"
            onClick={() => {
              if (canSubmit) onSubmit();
            }}
          >
            <HugeiconsIcon
              icon={busy ? Loading03Icon : ArrowUp02Icon}
              className={cn("size-4", busy && "animate-spin")}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
