import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Source_Code_Pro,
  Source_Sans_3,
  Source_Serif_4,
} from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

/** UI body: humanist sans, readable at small sizes (dense app chrome). */
const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Display / wordmark — pairs with Source Sans (shared Adobe lineage). */
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

/** Code, IDs, tabular metadata — matches sans family tone without default “dev” mono clichés. */
const sourceCode = Source_Code_Pro({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/** Sidebar app title only — distinct from body sans. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-wordmark",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Esteban's Workbench",
  description: "Personal Kanban — workspaces for everything I'm building",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sourceSans.variable} ${sourceSerif.variable} ${sourceCode.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
