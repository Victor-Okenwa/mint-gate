"use client";

import type { CommunityListItem } from "@/app/api/community/getAll/route";
import {
    CommunityCard,
    CommunityCardActions,
    CommunityCardDescription,
    CommunityCardHeader,
    CommunityCardJoinButton,
    CommunityCardMemberCount,
    CommunityCardMintPrice,
    CommunityCardViewButton,
} from "@/components/community-card";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { ccc } from "@ckb-ccc/connector-react";
import { SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 10;

export default function CommunitiesPage() {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<CommunityListItem[]>([]);
    const [page, setPage] = useState(1);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const signer = ccc.useSigner();
    const [userAddress, setUserAddress] = useState("");

    const loadingMoreRef = useRef(false);

    useEffect(() => {
        if (!signer) {
            setUserAddress("");
            return;
        }
        let cancelled = false;
        (async () => {
            const addr = await signer.getRecommendedAddress();
            if (!cancelled) setUserAddress(addr ?? "");
        })();
        return () => {
            cancelled = true;
        };
    }, [signer]);

    useEffect(() => {
        let cancelled = false;
        setInitialLoading(true);
        setError(null);
        setPage(1);
        setHasMore(true);
        (async () => {
            try {
                const params = new URLSearchParams({
                    page: "1",
                    limit: String(PAGE_SIZE),
                });
                if (userAddress) params.set("user_address", userAddress);
                const res = await fetch(`/api/community/getAll?${params}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error ?? "Failed to load communities");
                if (cancelled) return;
                const batch = json.communities as CommunityListItem[];
                setItems(batch);
                setHasMore(batch.length >= PAGE_SIZE);
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : "Something went wrong");
                    setItems([]);
                    setHasMore(false);
                }
            } finally {
                if (!cancelled) setInitialLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [userAddress, reloadToken]);

    const refetchInitial = useCallback(() => {
        setReloadToken((n) => n + 1);
    }, []);

    const loadMore = useCallback(async () => {
        if (!hasMore || initialLoading || loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        setError(null);
        const nextPage = page + 1;
        try {
            const params = new URLSearchParams({
                page: String(nextPage),
                limit: String(PAGE_SIZE),
            });
            if (userAddress) params.set("user_address", userAddress);
            const res = await fetch(`/api/community/getAll?${params}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Failed to load more");
            const batch = json.communities as CommunityListItem[];
            setItems((prev) => [...prev, ...batch]);
            setPage(nextPage);
            setHasMore(batch.length >= PAGE_SIZE);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load more");
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }, [hasMore, initialLoading, page, userAddress]);

    const handleRetryFetch = useCallback(() => {
        setError(null);
        if (items.length === 0) {
            refetchInitial();
        } else {
            void loadMore();
        }
    }, [items.length, loadMore, refetchInitial]);

    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !hasMore || initialLoading) return;

        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    void loadMore();
                }
            },
            { root: null, rootMargin: "160px", threshold: 0 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [loadMore, hasMore, initialLoading]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q),
        );
    }, [items, search]);

    return (
        <div className="px-4 pb-16 md:px-8">
            <div className="flex justify-center items-center sticky top-16 z-10 py-4">
                <fieldset className="w-full max-w-md bg-background rounded-full p-2 border border-border shadow-sm flex">
                    <InputGroup>
                        <InputGroupInput
                            placeholder="Search communities…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search communities"
                            className="rounded-full!"
                            name="search"
                        />
                        {/* <InputGroupAddon>
                            <SearchIcon className="size-4 text-muted-foreground" />
                        </InputGroupAddon> */}
                    </InputGroup>

                    <Button className="rounded-s-none rounded-e-full">
                        <SearchIcon />
                    </Button>
                </fieldset>
            </div>

            <section className="max-w-6xl mx-auto">
                {initialLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
                        <Spinner className="size-8" />
                        <span className="text-sm">Loading communities…</span>
                    </div>
                ) : error && items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
                        <p className="text-center text-sm text-destructive max-w-md" role="alert">
                            {error}
                        </p>
                        <Button type="button" variant="outline" onClick={handleRetryFetch}>
                            Try again
                        </Button>
                    </div>
                ) : (
                    <>
                        {error && items.length > 0 && (
                            <div
                                className="mb-6 flex flex-col items-center gap-3 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-4"
                                role="alert"
                            >
                                <p className="text-center text-sm text-destructive">{error}</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRetryFetch}
                                    disabled={loadingMore}
                                >
                                    Try again
                                </Button>
                            </div>
                        )}
                        {items.length === 0 ? (
                            <p className="text-center text-muted-foreground py-16">
                                No communities yet.
                            </p>
                        ) : filtered.length === 0 ? (
                            <p className="text-center text-muted-foreground py-16">
                                No communities match your search.
                            </p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filtered.map((community) => (
                                    <CommunityCard key={community.communityID}>
                                        <CommunityCardHeader
                                            title={community.name}
                                            isMember={community.isMember}
                                        />
                                        <CommunityCardDescription description={community.description} />
                                        <CommunityCardMemberCount count={community.membersCount} />
                                        &nbsp;
                                        <CommunityCardMintPrice
                                            price={community.mintPrice}
                                            className="text-foreground"
                                        />
                                        <CommunityCardActions>
                                            <CommunityCardViewButton
                                                href={`/community/${community.communityID}`}
                                            />
                                            {!community.isMember && <CommunityCardJoinButton mintPrice={community.mintPrice} creatorAddress={community.creatorAddress} communityId={community.communityID} />}
                                        </CommunityCardActions>
                                    </CommunityCard>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {!initialLoading && items.length > 0 && (
                    <div ref={sentinelRef} className="h-4 w-full" aria-hidden />
                )}

                {loadingMore && (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                        <Spinner className="size-6" />
                        <span className="text-sm">Loading more…</span>
                    </div>
                )}

                {!initialLoading &&
                    !loadingMore &&
                    !hasMore &&
                    items.length > 0 &&
                    (!search.trim() || filtered.length > 0) && (
                        <p className="text-center text-sm text-muted-foreground py-8">
                            No More Content
                        </p>
                    )}
            </section>
        </div>
    );
}
