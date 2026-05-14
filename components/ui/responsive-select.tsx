"use client";

import { Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import * as React from "react";
import { use } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Ctx = {
  isDesktop: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  register: (value: string, label: React.ReactNode) => void;
};

const ResponsiveSelectContext = React.createContext<Ctx | null>(null);

function useResponsiveSelect() {
  const ctx = use(ResponsiveSelectContext);
  if (!ctx)
    throw new Error(
      "ResponsiveSelect components must be used inside ResponsiveSelect",
    );
  return ctx;
}

const LabelMapContext = React.createContext<Map<
  string,
  React.ReactNode
> | null>(null);

function ResponsiveSelect({
  value,
  defaultValue,
  onValueChange,
  disabled,
  open: controlledOpen,
  onOpenChange,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;

  const [currentValue, setCurrentValue] = useControllableState<
    string | undefined
  >({
    prop: value,
    defaultProp: defaultValue,
    onChange: (nextValue) => {
      if (nextValue !== undefined) {
        onValueChange?.(nextValue);
      }
    },
  });
  const handleValueChange = (v: string) => {
    setCurrentValue(v);
  };

  const [open, setOpen] = useControllableState({
    prop: controlledOpen,
    defaultProp: false,
    onChange: onOpenChange,
  });

  const [labelMap, setLabelMap] = React.useState<Map<string, React.ReactNode>>(
    () => new Map()
  );
  const register = React.useCallback(
    (v: string, label: React.ReactNode) => {
      setLabelMap((prev) => {
        if (prev.get(v) === label) return prev;
        const next = new Map(prev);
        next.set(v, label);
        return next;
      });
    },
    [],
  );

  const ctx: Ctx = {
    isDesktop,
    value: currentValue,
    onValueChange: handleValueChange,
    disabled,
    open,
    setOpen,
    register,
  };

  if (isDesktop) {
    return (
      <ResponsiveSelectContext.Provider value={ctx}>
        <LabelMapContext.Provider value={labelMap}>
          <Select
            value={currentValue}
            onValueChange={handleValueChange}
            disabled={disabled}
            open={open}
            onOpenChange={setOpen}
          >
            {children}
          </Select>
        </LabelMapContext.Provider>
      </ResponsiveSelectContext.Provider>
    );
  }

  return (
    <ResponsiveSelectContext.Provider value={ctx}>
      <LabelMapContext.Provider value={labelMap}>
        <Drawer open={open} onOpenChange={setOpen}>
          {children}
        </Drawer>
      </LabelMapContext.Provider>
    </ResponsiveSelectContext.Provider>
  );
}

function ResponsiveSelectTrigger({
  className,
  size,
  children,
  ...props
}: React.ComponentProps<typeof SelectTrigger>) {
  const { isDesktop, disabled } = useResponsiveSelect();
  if (isDesktop) {
    return (
      <SelectTrigger className={className} size={size} {...props}>
        {children}
      </SelectTrigger>
    );
  }
  return (
    <DrawerTrigger asChild>
      <button
        type="button"
        disabled={disabled}
        data-size={size ?? "default"}
        className={cn(
          "flex w-fit items-center justify-between gap-1.5 rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs/relaxed whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-7 data-[size=sm]:h-6 dark:bg-input/30 dark:hover:bg-input/50",
          className,
        )}
      >
        {children}
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          strokeWidth={2}
          className="pointer-events-none size-3.5 shrink-0 text-muted-foreground"
        />
      </button>
    </DrawerTrigger>
  );
}

function ResponsiveSelectValue({
  placeholder,
  className,
  ...props
}: {
  placeholder?: string;
  className?: string;
} & React.ComponentProps<typeof SelectValue>) {
  const { isDesktop, value } = useResponsiveSelect();
  const labelMap = use(LabelMapContext);
  if (isDesktop) {
    return (
      <SelectValue placeholder={placeholder} className={className} {...props} />
    );
  }
  const label = value ? labelMap?.get(value) : undefined;
  return (
    <span
      data-slot="select-value"
      data-placeholder={!label || undefined}
      className={cn(
        "line-clamp-1 flex items-center gap-1.5",
        !label && "text-muted-foreground",
        className,
      )}
    >
      {label ?? placeholder}
    </span>
  );
}

function ResponsiveSelectContent({
  className,
  title,
  description,
  children,
  ...props
}: React.ComponentProps<typeof SelectContent> & {
  title?: string;
  description?: string;
}) {
  const { isDesktop } = useResponsiveSelect();
  if (isDesktop) {
    return (
      <SelectContent className={className} {...props}>
        {children}
      </SelectContent>
    );
  }
  return (
    <DrawerContent className="max-w-none px-0 pb-4">
      {title ? (
        <DrawerHeader className="px-5 pt-2 pb-0 text-left">
          <DrawerTitle className="text-base">{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
      ) : (
        <DrawerTitle className="sr-only">Select an option</DrawerTitle>
      )}
      <div className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto px-3 pt-2">
        {children}
      </div>
    </DrawerContent>
  );
}

function ResponsiveSelectGroup({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectGroup>) {
  const { isDesktop } = useResponsiveSelect();
  if (isDesktop) {
    return (
      <SelectGroup className={className} {...props}>
        {children}
      </SelectGroup>
    );
  }
  return (
    <div className={cn("flex flex-col gap-0.5 py-1", className)}>
      {children}
    </div>
  );
}

function ResponsiveSelectLabel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectLabel>) {
  const { isDesktop } = useResponsiveSelect();
  if (isDesktop) {
    return (
      <SelectLabel className={className} {...props}>
        {children}
      </SelectLabel>
    );
  }
  return (
    <div
      className={cn(
        "px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ResponsiveSelectItem({
  className,
  children,
  value,
  disabled,
  ...props
}: React.ComponentProps<typeof SelectItem>) {
  const {
    isDesktop,
    value: currentValue,
    onValueChange,
    setOpen,
    register,
  } = useResponsiveSelect();

  React.useEffect(() => {
    register(value, children);
  }, [register, value, children]);

  if (isDesktop) {
    return (
      <SelectItem
        value={value}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </SelectItem>
    );
  }
  const selected = currentValue === value;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors active:bg-accent",
        selected && "bg-accent/60",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <span className="flex-1 truncate">{children}</span>
      {selected && (
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-4" />
      )}
    </button>
  );
}

export {
  ResponsiveSelect,
  ResponsiveSelectContent,
  ResponsiveSelectGroup,
  ResponsiveSelectItem,
  ResponsiveSelectLabel,
  ResponsiveSelectTrigger,
  ResponsiveSelectValue,
};
