import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type SpinnerProps = Omit<
  React.ComponentPropsWithoutRef<typeof HugeiconsIcon>,
  "icon"
>;

function Spinner({ className, strokeWidth = 2, ...props }: SpinnerProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: The icon itself is the rendered status indicator for this UI primitive.
    <HugeiconsIcon
      icon={Loading03Icon}
      strokeWidth={strokeWidth}
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
