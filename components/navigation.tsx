import Link from "next/link";
import { Button } from "./ui/button";
import { WalletConnect, WalletConnectButton, WalletConnectInfoContainer, WalletConnectInfoImage } from "./ConnectWallet";

/**
 * Navigation component
 * @returns React.ReactNode
 */
export function Navigation({ isConnected }: { isConnected: boolean }) {
    // const { cccClient, signer } = useApp()

    // const { wallet, open } = cccClient;

    return (
        <nav className="sticky top-0 flex bg-background/80 backdrop-blur-md items-center justify-between px-8 py-6 border-b border-border w-full" >
            <Link href="/" className="text-sm font-semibold tracking-widest uppercase">Mint Gate</Link>

            {isConnected ? (
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button variant="outline" size="lg">Dashboard</Button>
                    </Link>

                    <WalletConnect>
                        <WalletConnectInfoContainer className="p-0 bg-transparent">
                            <WalletConnectInfoImage />
                        </WalletConnectInfoContainer>
                    </WalletConnect>

                    {/* {wallet && (<div className="cursor-pointer rounded-full  border-solid border-transparent transition-colors flex items-center justify-center bg-transparent text-foreground border gap-2 dark:hover:bg-secondary text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                        onClick={open} >
                        <div className="rounded-full mr-2">
                            {wallet && <img src={wallet.icon} alt="avatar" className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">
                                {balance} CKB
                            </h2>
                            <p className="text-xs flex items-center gap-2">
                                {truncateAddress(address, 10, 6)}
                            </p>
                        </div>
                    </div>)} */}


                </div>
            ) : (
                <WalletConnect>
                    <WalletConnectButton />
                </WalletConnect>
            )}
        </nav >
    );
}
