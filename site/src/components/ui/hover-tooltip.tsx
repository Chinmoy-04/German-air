"use client";

import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface HoverTooltipState {
  x: number;
  y: number;
  content: ReactNode;
}

/**
 * Cursor-anchored floating tooltip for hand-rolled SVG visuals (scatter
 * dots, chart crosshairs, bar tiles) that render their own SVG instead of
 * going through the full chart-context tooltip system in `components/charts`.
 *
 * `show`/`hide` are meant to be wired to `onMouseEnter`/`onMouseMove`/
 * `onMouseLeave` on the SVG element being annotated.
 */
export function useHoverTooltip() {
  const [tooltip, setTooltip] = useState<HoverTooltipState | null>(null);

  return {
    tooltip,
    show: (x: number, y: number, content: ReactNode) =>
      setTooltip({ x, y, content }),
    hide: () => setTooltip(null),
  };
}

/**
 * Portals to `document.body` and positions with `position: fixed` from raw
 * viewport coordinates — never clipped by an `overflow-hidden` ancestor
 * (same fix as `InfoTooltip`).
 */
export function HoverTooltip({ tooltip }: { tooltip: HoverTooltipState | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!(mounted && tooltip)) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-lg border border-border/60 bg-popover px-2.5 py-1.5 text-[11px] leading-snug whitespace-nowrap text-popover-foreground shadow-md"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      {tooltip.content}
    </div>,
    document.body
  );
}
