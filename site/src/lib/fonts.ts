import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

// Chosen via the temporary FontSwitcher A/B comparison (see decisions.md,
// 2026-08-12 "Lock in fonts"). These variable names are what
// globals.css's `@theme inline` block maps to Tailwind's
// `font-sans` / `font-heading` / `font-mono` utilities.
const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const heading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const allFontVariables = [sans.variable, heading.variable, mono.variable].join(
  " "
);
