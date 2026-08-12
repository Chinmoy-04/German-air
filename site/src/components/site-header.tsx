"use client";

import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { motion, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wind } from "lucide-react";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";

/**
 * Scrollspy for the home page's two sections ("Story" = hero/thesis/preview,
 * "Methods" = the `#methods` section). Mirrors the nav highlight to whichever
 * one is actually in view instead of only reflecting the URL, since both
 * live on the same route ("/").
 */
function useActiveSection(pathname: string) {
  const [activeSection, setActiveSection] = useState<"story" | "methods">(
    "story"
  );

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }
    const methodsEl = document.getElementById("methods");
    if (!methodsEl) {
      return;
    }
    // Shrinks the observed viewport to the band just below the sticky
    // header, in the upper ~60% of the screen — the section is considered
    // "active" once it reaches that band, matching typical scrollspy feel.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.top <= 0) {
          setActiveSection("methods");
        } else {
          setActiveSection("story");
        }
      },
      { rootMargin: "-64px 0px -40% 0px", threshold: 0 }
    );
    observer.observe(methodsEl);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("story");
    }
  }, [pathname]);

  return activeSection;
}

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
  {
    href: "/",
    label: "Story",
    match: (path: string, section: "story" | "methods") =>
      path === "/" && section === "story",
  },
  {
    href: "/#methods",
    label: "Methods",
    match: (path: string, section: "story" | "methods") =>
      path === "/" && section === "methods",
  },
];

export function SiteHeader() {
  const pathname = usePathname();
  const activeSection = useActiveSection(pathname);
  const lenis = useLenis();

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
              onClick={(event) => {
                // Already home and heading to the top-of-page tab: Next won't
                // re-navigate to the same URL, so drive the scroll ourselves
                // instead of leaving the click feeling like a dead click.
                if (link.href === "/" && pathname === "/") {
                  event.preventDefault();
                  lenis?.scrollTo(0);
                }
              }}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                link.match(pathname, activeSection) && "bg-muted text-foreground"
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
