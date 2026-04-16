"use client";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { CommunityDetail } from "@/utils/constants";
import { useCallback, useEffect, useState } from "react";

export default function CommunityPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [communityDetails, setCommunityDetails] = useState<CommunityDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const { userAddress } = useApp()

    useEffect(() => {
        setIsLoading(true)
        setError(null)
        const pathSplit = location.pathname.split("/")
        const id = pathSplit[pathSplit.length - 1];

        (async () => {
            try {

                const params = new URLSearchParams();
                if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
                    setError("Community Invalid or not found");
                    setIsLoading(false);
                    return;
                }
                params.set("community_id", id);
                if (userAddress) params.set("user_address", userAddress);

                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 15_000); // 15 seconds timeout

                let res;
                try {
                    res = await fetch(`/api/community/getCommunity?${params}`, {
                        signal: controller.signal,
                    });
                } finally {
                    clearTimeout(timeout);
                }

                const json = await res.json();
                if (!res.ok) throw new Error(json.error ?? "Failed to load communities");

                const details = json.communities as CommunityDetail;
                setCommunityDetails(details);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Something went wrong")
            } finally {
                setIsLoading(false)
            }
        })();

    }, [userAddress, reloadToken])


    const refetch = useCallback(() => {
        setReloadToken((n) => n + 1);
    }, []);

    return (
        <>
            {
                isLoading && (
                    <LoadingSkeletion />
                )
            }

            {
                error && (
                    <section className="min-h-screen flex justify-center items-center">
                        <div className="flex flex-col gap-2 items-center">
                            <p className="text-center text-destructive">{error}</p>
                            <Button onClick={refetch}> Try Again </Button>
                        </div>
                    </section>
                )
            }

            {!isLoading && !error && (
                <article className="">

                    <section className="flex flex-wrap gap-2 py-2 px-2">
                        <hgroup className="space-y-2">
                            <h1 className="text-2xl fonct-bold">{communityDetails?.name}</h1>
                            <p className="text-muted sm:text-sm text-xs">{communityDetails?.description}</p>
                        </hgroup>

                    </section>

                    <Separator className="my-2" />

                </article>
            )}
        </>
    );
};

function LoadingSkeletion() {
    return (
        <div className="min-h-screen">
            <Spinner className="size-10" />
        </div>
    )
}
