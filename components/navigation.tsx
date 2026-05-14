import Link from "next/link";
import { Button } from "./ui/button";
import { WalletConnect, WalletConnectButton, WalletConnectInfoContainer, WalletConnectInfoImage } from "./ConnectWallet";
import { SidebarTrigger } from "./ui/sidebar";
import { PlusIcon } from "lucide-react";

/**
 * Navigation component
 * @returns React.ReactNode
 */
export function Navigation({ isConnected }: { isConnected: boolean }) {

    return (
        <nav className="sticky top-0 flex bg-background/80 backdrop-blur-md items-center justify-between px-8 py-6 border-b border-border w-full" >
            {isConnected ? (
                <SidebarTrigger />
            ) : (
                <Link href="/" className="text-sm font-semibold tracking-widest uppercase">Mint Gate</Link>
            )}

            {isConnected ? (
                <div className="flex items-center gap-2">
                    <Button asChild><Link href="/create-community"> <PlusIcon /> Create </Link></Button>
                </div>
            ) : (
                <WalletConnect>
                    <WalletConnectButton />
                </WalletConnect>
            )}
        </nav >
    );
}
