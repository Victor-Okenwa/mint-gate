"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { WalletConnect, WalletConnectButton } from "@/components/ConnectWallet";

export default function Home() {
  const { isConnected } = useApp();

  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-32 text-center">
        <h1 className="text-5xl font-bold tracking-tight leading-tight max-w-2xl md:text-6xl">
          Own Your Membership. On-Chain.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-lg">
          A decentralized community protocol built on Nervos CKB.
        </p>
        <div className="flex gap-4 mt-10">
          {isConnected ? (
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          ) : (
            <WalletConnect>
              <WalletConnectButton />
            </WalletConnect>
          )}
          <Link href="/communities">
            <Button variant="outline" size="lg">Explore Communities</Button>
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-8 py-24 border-t border-border">
        <h2 className="text-2xl font-semibold text-center mb-16 tracking-tight">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {[
            { step: "01", title: "Connect Wallet", desc: "Link your CKB wallet to establish your on-chain identity." },
            { step: "02", title: "Join Community", desc: "Mint a membership cell to join any community on the protocol." },
            { step: "03", title: "Access Features", desc: "Unlock gated content, governance, and community resources." },
          ].map((item) => (
            <div key={item.step} className="space-y-4">
              <span className="text-xs text-muted-foreground font-mono">{item.step}</span>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why On-Chain */}
      <section className="px-8 py-24 border-t border-border">
        <h2 className="text-2xl font-semibold text-center mb-16 tracking-tight">Why On-Chain Membership</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { title: "Transparent", desc: "All membership data is publicly verifiable on the CKB blockchain." },
            { title: "Verifiable", desc: "Cryptographic proof of membership without intermediaries." },
            { title: "Portable", desc: "Your identity and memberships travel with your wallet." },
          ].map((item) => (
            <div key={item.title} className="border border-border p-8 space-y-3 hover:bg-secondary/50 transition-colors">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Mint Gate</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
        </div>
      </footer>

    </div>
  );
}
