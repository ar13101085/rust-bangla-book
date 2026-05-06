import { component$, Slot, type QwikIntrinsicElements } from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type DivProps = QwikIntrinsicElements["div"];

export const Card = component$<DivProps>(({ class: className, ...rest }) => {
  return (
    <div
      class={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm",
        className as string,
      )}
      {...rest}
    >
      <Slot />
    </div>
  );
});

export const CardHeader = component$<DivProps>(
  ({ class: className, ...rest }) => (
    <div class={cn("flex flex-col gap-1.5 p-6", className as string)} {...rest}>
      <Slot />
    </div>
  ),
);

export const CardTitle = component$<DivProps>(
  ({ class: className, ...rest }) => (
    <div
      class={cn(
        "text-xl font-bold leading-tight tracking-tight",
        className as string,
      )}
      {...rest}
    >
      <Slot />
    </div>
  ),
);

export const CardDescription = component$<DivProps>(
  ({ class: className, ...rest }) => (
    <div
      class={cn("text-sm text-[var(--muted-foreground)]", className as string)}
      {...rest}
    >
      <Slot />
    </div>
  ),
);

export const CardContent = component$<DivProps>(
  ({ class: className, ...rest }) => (
    <div class={cn("p-6 pt-0", className as string)} {...rest}>
      <Slot />
    </div>
  ),
);
