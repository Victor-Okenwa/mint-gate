import { Button } from "@/components/ui/button";
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
} from "@/components/ui/sidebar";
import Link from "next/link";

const sidebarItems = [
    { title: "My Memberships", url: "/dashboard" },
    { title: "Discover Communities", url: "/dashboard" },
    { title: "Create Community", url: "/create" },
    { title: "Settings", url: "/dashboard" },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
            <Button variant="outline">Disconnect</Button>
        </nav >
    )
}

function AppSidebar() {
    return (
        <Sidebar className="border-r border-border" collapsible="icon">
            <div className="px-4 py-5 border-b border-border">
                <Link href="/dashboard" className="text-sm font-semibold tracking-widest uppercase">Mint Gate</Link>
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
            </SidebarContent>
        </Sidebar>
    );
}
