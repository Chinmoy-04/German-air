"use client";

import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  type CSSProperties,
  type RefObject,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
  /** Explanation shown in the floating panel on hover/focus. */
  description: string;
  /** Extra classes on the trigger button. */
  className?: string;
}

/**
 * Small "i" glyph that reveals a short explanation on hover/focus.
 * Kept dependency-free (no Radix) since it only ever shows static text.
 * Portaled to `document.body` and positioned from the trigger's real screen
 * coordinates (`getBoundingClientRect`) instead of `absolute` inside the
 * card — the KPI cards it lives in use `overflow-hidden`, which was
 * clipping an `absolute bottom-full` panel before it could render.
 */
export function InfoTooltip({ description, className }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();

  return (
    <>
      <button
        aria-describedby={tooltipId}
        className={cn(
          "inline-flex text-muted-foreground/50 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none",
          className
        )}
        onBlur={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        ref={triggerRef}
        type="button"
      >
        <Info aria-hidden className="size-3" />
        <span className="sr-only">More info</span>
      </button>
      {open && (
        <InfoTooltipPanel
          description={description}
          tooltipId={tooltipId}
          triggerRef={triggerRef}
        />
      )}
    </>
  );
}

function InfoTooltipPanel({
  description,
  tooltipId,
  triggerRef,
}: {
  description: string;
  tooltipId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const [style, setStyle] = useState<CSSProperties>({ opacity: 0 });

  useLayoutEffect(() => {
    const update = () => {
      const el = triggerRef.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      // Flip below the trigger if there isn't enough room above for the panel.
      const placeBelow = rect.top < 90;
      setStyle({
        top: placeBelow ? rect.bottom + 8 : rect.top - 8,
        left: rect.left + rect.width / 2,
        transform: `translate(-50%, ${placeBelow ? "0" : "-100%"})`,
        opacity: 1,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [triggerRef]);

  return createPortal(
    <span
      className="pointer-events-none fixed z-[100] w-44 rounded-lg border border-border/60 bg-popover px-2.5 py-1.5 text-[11px] leading-snug font-normal normal-case tracking-normal text-popover-foreground shadow-md transition-opacity duration-150"
      id={tooltipId}
      role="tooltip"
      style={style}
    >
      {description}
    </span>,
    document.body
  );
}

export default InfoTooltip;
