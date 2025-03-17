import * as React from "react";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number;
    max?: number;
    determinate?: boolean;
  }
>(({ className, value = 0, max = 100, determinate = true, ...props }, ref) => {
  const percentage = Math.min(Math.max(0, value), max) / max;

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      {determinate ? (
        <div
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - percentage * 100}%)` }}
        />
      ) : (
        <div className="animate-indeterminate h-full w-1/2 bg-primary rounded-full" />
      )}
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
