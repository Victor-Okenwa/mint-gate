"use client"

import { HomeCommunities } from "@/components/home/home-communities"
import { HomeFaq } from "@/components/home/home-faq"
import { WalletConnect, WalletConnectButton } from "@/components/ConnectWallet"
import { useApp } from "@/components/providers/app-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const STEPS = [
  {
    step: "01",
    title: "Connect a CKB wallet",
    desc: "Use CCC to connect. Your address is how Mint Gate recognizes you as creator or member.",
  },
  {
    step: "02",
    title: "Create or join",
    desc: "Creators set a mint price in CKB and optional gated link. Members pay that fee on-chain to join.",
  },
  {
    step: "03",
    title: "Unlock gated access",
    desc: "Members and creators can open the community’s private link. Browse, search, and manage memberships in the app.",
  },
] as const

/** Default home page. Marketing surface for Mint Gate. */
export default function Home() {
  const { isConnected } = useApp()

  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-24 pt-20 text-center md:px-8 md:pb-32 md:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_oklab,var(--muted)_80%,transparent),transparent)]"
        />
        <p className="animate-in fade-in slide-in-from-bottom-2 mb-6 text-sm font-semibold tracking-[0.35em] uppercase duration-700">
          Mint Gate
        </p>
        <h1 className="animate-in fade-in slide-in-from-bottom-3 mx-auto max-w-3xl text-4xl font-bold tracking-tight duration-700 md:text-6xl md:leading-[1.1]">
          Paid communities on Nervos CKB
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-4 mx-auto mt-6 max-w-xl text-base text-muted-foreground duration-700 md:text-lg">
          Creators set a CKB gate fee. Members pay from their wallet and unlock
          private access — starting with a gated link.
        </p>
        <div className="animate-in fade-in mt-10 flex flex-wrap items-center justify-center gap-3 duration-700">
          {isConnected ? (
            <Button asChild size="lg">
              <Link href="/create-community">Create a community</Link>
            </Button>
          ) : (
            <WalletConnect>
              <WalletConnectButton size="lg" className="text-sm! rounded-none h-10" />
            </WalletConnect>
          )}
          <Button asChild variant="outline" size="lg" className="text-sm rounded-none">
            <Link href="/communities">Explore communities</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-center text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-muted-foreground">
            Semi-decentralized by design: CKB settles the fee; the app indexes
            communities and delivers gated content.
          </p>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="space-y-3 text-left">
                <span className="font-mono text-xs text-muted-foreground">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeCommunities />

      <HomeFaq />

      <footer className="flex items-center justify-between border-t border-border px-6 py-8 text-xs text-muted-foreground md:px-8">
        <span className="font-semibold tracking-widest uppercase">Mint Gate</span>
        <div className="flex gap-6">
          <Link href="/communities" className="transition-colors hover:text-foreground">
            Communities
          </Link>
          <a
            href="https://github.com/Victor-Okenwa/mint-gate"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
