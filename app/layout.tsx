import type { Metadata } from "next";
import "./globals.css";
import { LayoutProvider } from "./layoutProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import AppProvider from "@/components/providers/app-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Mint Gate",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <LayoutProvider>
        <body
          className="bg-background text-foreground antialiased"
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AppProvider>
              {children}
            </AppProvider>
            <Toaster position="top-right" richColors duration={4000} />
          </ThemeProvider>
        </body>
      </LayoutProvider>
    </html>
  );
}
