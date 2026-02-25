import ConnectWallet from "./ConnectWallet";
import Link from "next/link";
import { Button } from "./ui/button";
import { useApp } from "./providers/app-provider";


/**
 * Navigation component
 * @returns React.ReactNode
 */
export function Navigation() {
    const { isConnected } = useApp();

    return (
        <nav className="sticky top-0 flex bg-background/80 backdrop-blur-md items-center justify-between px-8 py-6 border-b border-border w-full" >
            <span className="text-sm font-semibold tracking-widest uppercase">Mint Gate</span>

            {isConnected ? (
                <Link href="/dashboard">
                    <Button variant="outline" size="lg">Dashboard</Button>
                </Link>
            ) : (
                <ConnectWallet />
            )}
        </nav >
    );
}
