import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "四象 · Quadrant",
  description: "用艾森豪威尔矩阵整理待办：分清重要与紧急，专注真正值得做的事。",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <body className="min-h-full">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delay={400}>
            {children}
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
