import AppProvider from "@/components/providers/app-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { LayoutProvider } from "./layoutProvider";

export const metadata: Metadata = {
  title: "Mint Gate",
  description:
    "Paid, wallet-native communities on Nervos CKB. Pay a gate fee in CKB and unlock private access.",
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
            <Toaster position="top-right" richColors duration={5000} />
          </ThemeProvider>
        </body>
      </LayoutProvider>
    </html>
  );
}
