"use client";

import * as React from "react";
import { use } from "react";
import { Slot } from "radix-ui";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type ResponsiveDropdownMenuContextValue = {
  isDesktop: boolean;
  onClose: () => void;
};

const ResponsiveDropdownMenuContext =
  React.createContext<ResponsiveDropdownMenuContextValue | null>(null);

function useResponsiveDropdownMenu() {
  const context = use(ResponsiveDropdownMenuContext);
  if (!context) {
    throw new Error(
      "ResponsiveDropdownMenu components must be used within ResponsiveDropdownMenu",
    );
  }
  return context;
}

type ResponsiveDropdownMenuProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

function ResponsiveDropdownMenu({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}: ResponsiveDropdownMenuProps) {
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleClose = React.useCallback(
    () => onOpenChange?.(false),
    [onOpenChange],
  );

  const ctx = { isDesktop, onClose: handleClose };

  if (isDesktop) {
    return (
      <ResponsiveDropdownMenuContext.Provider value={ctx}>
        <DropdownMenu open={open} onOpenChange={onOpenChange}>
          {children}
        </DropdownMenu>
      </ResponsiveDropdownMenuContext.Provider>
    );
  }

  return (
    <ResponsiveDropdownMenuContext.Provider value={ctx}>
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    </ResponsiveDropdownMenuContext.Provider>
  );
}

function ResponsiveDropdownMenuTrigger(
  props: React.ComponentProps<typeof DropdownMenuTrigger>,
) {
  const { isDesktop } = useResponsiveDropdownMenu();
  return isDesktop ? (
    <DropdownMenuTrigger {...props} />
  ) : (
    <DrawerTrigger {...props} />
  );
}

function ResponsiveDropdownMenuContent({
  className,
  title,
  description,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent> & {
  title?: string;
  description?: string;
}) {
  const { isDesktop } = useResponsiveDropdownMenu();

  if (isDesktop) {
    return (
      <DropdownMenuContent className={className} {...props}>
        {children}
      </DropdownMenuContent>
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
        <DrawerTitle className="sr-only">Actions</DrawerTitle>
      )}
      <div className="flex flex-col gap-1 px-3 pt-2">{children}</div>
    </DrawerContent>
  );
}

function ResponsiveDropdownMenuItem({
  className,
  children,
  onClick,
  disabled,
  variant,
  asChild,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & {
  variant?: "default" | "destructive";
}) {
  const { isDesktop, onClose } = useResponsiveDropdownMenu();

  if (isDesktop) {
    return (
      <DropdownMenuItem
        className={className}
        onClick={onClick}
        disabled={disabled}
        variant={variant}
        asChild={asChild}
        {...props}
      >
        {children}
      </DropdownMenuItem>
    );
  }

  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      type={asChild ? undefined : "button"}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors",
        "active:bg-accent",
        disabled && "pointer-events-none opacity-50",
        variant === "destructive"
          ? "text-destructive [&_svg]:text-destructive"
          : "[&_svg:not([class*='text-'])]:text-muted-foreground",
        "[&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0",
        className,
      )}
      onClick={(e) => {
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
        onClose();
      }}
    >
      {children}
    </Comp>
  );
}

function ResponsiveDropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  const { isDesktop } = useResponsiveDropdownMenu();
  if (isDesktop) {
    return <DropdownMenuSeparator className={className} {...props} />;
  }
  return <div className={cn("my-1 h-px bg-border", className)} />;
}

function ResponsiveDropdownMenuLabel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel>) {
  const { isDesktop } = useResponsiveDropdownMenu();
  if (isDesktop) {
    return (
      <DropdownMenuLabel className={className} {...props}>
        {children}
      </DropdownMenuLabel>
    );
  }
  return (
    <div
      className={cn(
        "px-3 py-1.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export {
  ResponsiveDropdownMenu,
  ResponsiveDropdownMenuTrigger,
  ResponsiveDropdownMenuContent,
  ResponsiveDropdownMenuItem,
  ResponsiveDropdownMenuSeparator,
  ResponsiveDropdownMenuLabel,
  useResponsiveDropdownMenu,
};
