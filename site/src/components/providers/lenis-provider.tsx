"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import type { ReactNode } from "react";

export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        anchors: true,
        // `duration` + a one-directional ease-out curve animates toward a
        // fresh target on every wheel tick, so reversing direction restarts
        // that curve mid-flight and compounds into a felt lag on the way
        // back up. `lerp` continuously chases the raw scroll delta every
        // frame instead, which stays symmetric regardless of direction.
        lerp: 0.09,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        respectReducedMotion: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
