import ConnectWallet from "./ConnectWallet";
import Link from "next/link";
import { Button } from "./ui/button";


/**
 * Navigation component
 * @returns React.ReactNode
 */
export function Navigation({ isConnected }: { isConnected: boolean }) {
    return (
        <nav className="sticky top-0 flex bg-background/80 backdrop-blur-md items-center justify-between px-8 py-6 border-b border-border w-full" >
            <Link href="/" className="text-sm font-semibold tracking-widest uppercase">Mint Gate</Link>

            {isConnected ? (
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button variant="outline" size="lg">Dashboard</Button>
                    </Link>

                    <ConnectWallet  />
                </div>
            ) : (
                <ConnectWallet />
            )}
        </nav >
    );
}
