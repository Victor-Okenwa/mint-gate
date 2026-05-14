"use client";

import { Navigation } from "@/components/navigation";
import { useApp } from "@/components/providers/app-provider";
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { WalletConnect } from "@/components/ConnectWallet";
import { WalletConnectInfoAddress, WalletConnectInfoBalance, WalletConnectInfoContainer, WalletConnectInfoImage } from "@/components/ConnectWallet";

const sidebarItems = [
    { title: "Home", url: "/" },
    { title: "My Communities", url: "/my-communities" },
    { title: "My Memberships", url: "/my-memberships" },
    { title: "Discover Communities", url: "/communities" },
    { title: "Create Community", url: "/create-community" },
];

function AppSidebar() {
    const { open } = useSidebar();

    return (
        <Sidebar className="border-r border-border overflow-hidden" collapsible="icon">
            <div className="px-4 py-5 border-b border-border">
                <Link href="/" className={cn("text-sm font-semibold tracking-widest uppercase", {
                    "truncate-text text-[9px]": !open,
                })}>Mint Gate</Link>
            </div>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground">Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sidebarItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href={item.url}
                                            className="text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                                        >
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className={cn("mt-auto border-t border-border pt-4", {
                    "hidden": !open,
                })}>
                    <SidebarGroupLabel className="text-xs text-muted-foreground">Wallet</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <WalletConnect>
                            <WalletConnectInfoContainer className="flex gap-1 items-center bg-muted py-2 px-4">
                                <WalletConnectInfoImage />

                                <div className="flex flex-col">
                                    <WalletConnectInfoBalance decimalPlaces={2} className="text-sm" />
                                    <WalletConnectInfoAddress frontChars={5} endChars={5} />
                                </div>
                            </WalletConnectInfoContainer>
                        </WalletConnect>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const { isConnected } = useApp();

    return (
        <div className="min-h-screen">
            <SidebarProvider>
                {isConnected && (
                    <AppSidebar />
                )}

                <section className="w-full">
                    <Navigation isConnected={isConnected} />

                    {children}
                </section>
            </SidebarProvider>
        </div>
    );
}
