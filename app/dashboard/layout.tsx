"use client";

import { ccc } from "@ckb-ccc/connector-react";
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
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import ConnectWallet from "@/components/ConnectWallet";

const sidebarItems = [
    { title: "My Memberships", url: "/dashboard" },
    { title: "Discover Communities", url: "/dashboard" },
    { title: "Create Community", url: "/dashboard/create-community" },
    { title: "Settings", url: "/dashboard" },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const signer = ccc?.useSigner();
    const router = useRouter();

    useEffect(() => {
        const checkIsConnected = async () => {
            await signer?.isConnected().then((isConnected) => {
                if (!isConnected) {
                    router.push("/");
                }
            });

        }
        checkIsConnected();
    }, [signer, router]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 w-full">
                <AppHeader />
                {children}
            </main>
        </SidebarProvider>
    );
}


function AppHeader() {
    return (
        <nav className="sticky top-0 flex bg-background/80 backdrop-blur-md items-center justify-between h-[64.8px] px-4 border-b border-border" >
            <SidebarTrigger />

            <Button asChild><Link href="/dashboard/create-community"><PlusIcon /> Create</Link></Button>
        </nav >
    )
}

function AppSidebar() {
    const { open } = useSidebar();

    return (
        <Sidebar className="border-r border-border overflow-hidden" collapsible="icon">
            <div className="px-4 py-5 border-b border-border">
                <Link href="/dashboard" className={cn("text-sm font-semibold tracking-widest uppercase", {
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
                        <ConnectWallet />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
