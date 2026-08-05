"use client";

import { CommunityListItem } from "@/app/api/community/get-all/route";
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
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PAGE_SIZE } from "@/utils/constants";
import { useCallback, useEffect, useRef, useState, startTransition } from "react";

export default function SearchPage() {
    const [search, setSearch] = useState("");
    const [initialSearch, setInitialSearch] = useState("");
    const [items, setItems] = useState<CommunityListItem[]>([]);
    const [page, setPage] = useState(1);
    const [initialLoading, setInitialLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userAddress } = useApp();
    const loadingMoreRef = useRef(false);

    // Read search param from URL and auto-search
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const searchParam = params.get("search") ?? "";
        if (searchParam.trim()) {
            startTransition(() => {
                setInitialSearch(searchParam);
                setSearch(searchParam);
                setInitialLoading(true);
                setError(null);
            });

            const fetchParams = new URLSearchParams({
                search: searchParam,
                page: "1",
                limit: String(PAGE_SIZE),
            });
            if (userAddress) fetchParams.set("user_address", userAddress);

            fetch(`/api/community/search?${fetchParams}`)
                .then(async (res) => {
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error ?? "Failed to search communities");
                    const batch = json.communities as CommunityListItem[];
                    setItems(batch);
                    setHasMore(batch.length >= PAGE_SIZE);
                })
                .catch((e) => {
                    setError(e instanceof Error ? e.message : "Something went wrong");
                    setItems([]);
                    setHasMore(false);
                })
                .finally(() => {
                    setInitialLoading(false);
                });
        }
    }, [userAddress]);

    const fetchSearchResults = useCallback(async (searchValue: string, currentPage: number, append: boolean) => {
        if (!searchValue.trim()) return;

        try {
            const params = new URLSearchParams({
                search: searchValue,
                page: String(currentPage),
                limit: String(PAGE_SIZE),
            });
            if (userAddress) params.set("user_address", userAddress);

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 25_000);

            let res;
            try {
                res = await fetch(`/api/community/search?${params}`, {
                    signal: controller.signal,
                });
            } finally {
                clearTimeout(timeout);
            }

            const json = await res.json();

            if (!res.ok) throw new Error(json.error ?? "Failed to search communities");

            const batch = json.communities as CommunityListItem[];

            if (append) {
                setItems((prev) => [...prev, ...batch]);
            } else {
                setItems(batch);
            }
            setHasMore(batch.length >= PAGE_SIZE);
            setPage(currentPage);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
            if (!append) {
                setItems([]);
                setHasMore(false);
            }
        }
    }, [userAddress]);

    const loadMore = useCallback(async () => {
        if (!hasMore || initialLoading || loadingMoreRef.current || !search.trim()) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        setError(null);
        const nextPage = page + 1;
        try {
            await fetchSearchResults(search, nextPage, true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load more");
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }, [hasMore, initialLoading, page, search, fetchSearchResults]);

    const handleRetryFetch = useCallback(() => {
        setError(null);
        // Always retry with search from URL, do an initial fetch if empty, otherwise load more
        if (items.length === 0) {
            // Refetch the first page with the current search (from URL param)
            setInitialLoading(true);
            setPage(1);
            fetchSearchResults(search, 1, false);
        } else {
            void loadMore();
        }
    }, [items.length, loadMore, fetchSearchResults, search]);

    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !hasMore || initialLoading || loadingMore) return;

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
    }, [loadMore, hasMore, initialLoading, loadingMore]);

    return (
        <div className="px-4 pb-16 md:px-8 pt-10">
            <section className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-6">Search Results</h1>
                    {/* Search form is intentionally removed */}
                </div>

                {initialLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
                        <Spinner className="size-8" />
                        <span className="text-sm">Loading search results…</span>
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
                ) : items.length === 0 ? (
                    <p className="text-center text-muted-foreground py-16">
                        No communities found matching &quot;{initialSearch || search}&quot;.
                    </p>
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
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((community) => (
                                <CommunityCard key={community.communityID}>
                                    <CommunityCardHeader
                                        title={community.name}
                                        isMember={community.isMember}
                                        isCreator={community.isCreator}
                                    />
                                    <CommunityCardDescription description={community.description} />
                                    <CommunityCardMemberCount count={Number(community.membersCount)} />
                                    &nbsp;
                                    <CommunityCardMintPrice
                                        price={community.mintPrice}
                                        className="text-foreground"
                                    />
                                    <CommunityCardActions>
                                        <CommunityCardViewButton
                                            href={`/community/${community.communityID}`}
                                        />

                                        {!(community.isCreator || community.isMember) && (
                                            <CommunityCardJoinButton
                                                mintPrice={community.mintPrice}
                                                creatorAddress={community.creatorAddress}
                                                communityId={community.communityID}
                                            />
                                        )}
                                    </CommunityCardActions>
                                </CommunityCard>
                            ))}
                        </div>
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
                    items.length > 0 && (
                        <p className="text-center text-sm text-muted-foreground py-8">
                            No More Content
                        </p>
                    )}
            </section>
        </div>
    );
}
