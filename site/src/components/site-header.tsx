"use client";

import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { motion, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wind } from "lucide-react";

/**
 * Thin progress hairline synced to Lenis's smoothed scroll position (Motion's
 * `useScroll` reads the native `scrollY`, which Lenis drives directly).
 * `scrollYProgress` is bound straight to `scaleX` (no `useSpring` on top) so
 * Motion can run it off the browser's native ScrollTimeline instead of a
 * JS-driven simulation on every scroll frame — one less thing competing for
 * the main thread while scrolling.
 */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-primary"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

const links = [
  { href: "/", label: "Story", match: (path: string) => path === "/" },
  {
    href: "/#methods",
    label: "Methods",
    match: () => false,
  },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 contain-paint border-b border-border/70 bg-background/80 backdrop-blur-sm will-change-transform"
    >
      <ScrollProgress />
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-sm font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wind className="size-4" aria-hidden />
          </span>
          German Air
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                link.match(pathname) && "bg-muted text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/explore"
            className={cn(buttonVariants({ size: "sm" }), "rounded-lg")}
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
