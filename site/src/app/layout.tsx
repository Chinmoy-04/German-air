import { LenisProvider } from "@/components/providers/lenis-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { allFontVariables } from "@/lib/fonts";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "German Air · Pollution & Respiratory Mortality",
  description:
    "Portfolio study of German federal-state air quality and age-standardised respiratory mortality, 2019–2023.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${allFontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LenisProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border/70 py-8 text-center text-xs text-muted-foreground">
              German Air · UBA + GBE data · Portfolio visualisation
            </footer>
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
