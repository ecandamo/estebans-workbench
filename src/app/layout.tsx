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

/** Available for prose / long-form content if needed; not used for headings. */
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

/** Editorial headings and wordmark — all h1/h2 level text uses this for a consistent technical voice. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-wordmark",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Workbench",
  description: "Personal Kanban — workspaces for everything you're building",
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
