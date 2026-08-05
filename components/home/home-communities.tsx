"use client"

import type { CommunityListItem } from "@/app/api/community/get-all/route"
import {
  CommunityCard,
  CommunityCardActions,
  CommunityCardDescription,
  CommunityCardHeader,
  CommunityCardJoinButton,
  CommunityCardMemberCount,
  CommunityCardMintPrice,
  CommunityCardViewButton,
} from "@/components/community-card"
import { useApp } from "@/components/providers/app-provider"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { useEffect, useState, startTransition } from "react"

const TOP_LIMIT = 6

/** Top communities by member count for the home page. */
export function HomeCommunities() {
  const { userAddress } = useApp()
  const [items, setItems] = useState<CommunityListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    startTransition(() => {
      setLoading(true)
      setError(null)
    })

    ;(async () => {
      try {
        const params = new URLSearchParams({ limit: String(TOP_LIMIT) })
        if (userAddress) params.set("user_address", userAddress)

        const res = await fetch(`/api/community/get-top?${params}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? "Failed to load communities")
        if (cancelled) return

        setItems((json.communities as CommunityListItem[]) ?? [])
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong")
          setItems([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userAddress])

  return (
    <section className="border-t border-border px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Top communities
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Ranked by member count — join with CKB or open a community to explore.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : error ? (
          <p className="py-12 text-center text-sm text-destructive">{error}</p>
        ) : items.length === 0 ? (
          <div className="space-y-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No communities yet. Be the first to create one.
            </p>
            <Button asChild>
              <Link href="/create-community">Create a community</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((community) => (
                <CommunityCard key={community.communityID}>
                  <CommunityCardHeader
                    title={community.name}
                    isMember={community.isMember}
                    isCreator={community.isCreator}
                  />
                  <CommunityCardDescription
                    description={community.description || "No description yet."}
                    className="line-clamp-3"
                  />
                  <div className="flex items-center gap-4">
                    <CommunityCardMemberCount count={community.membersCount ?? 0} />
                    <CommunityCardMintPrice price={community.mintPrice} />
                  </div>
                  <CommunityCardActions>
                    <CommunityCardViewButton href={`/community/${community.communityID}`} />
                    {!community.isCreator && !community.isMember && (
                      <CommunityCardJoinButton
                        mintPrice={community.mintPrice}
                        communityId={community.communityID}
                        creatorAddress={community.creatorAddress}
                      />
                    )}
                  </CommunityCardActions>
                </CommunityCard>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/communities">View more communities</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
