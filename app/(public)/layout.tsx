"use client";

import { Navigation } from "@/components/navigation";
import { useApp } from "@/components/providers/app-provider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const { isConnected } = useApp();

    return (
        <main className="min-h-screen">
            <Navigation isConnected={isConnected} />
            {children}
        </main>
    );
}