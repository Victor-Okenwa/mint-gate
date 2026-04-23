"use client";
import { CommunityCardJoinButton } from "@/components/community-card";
import { useApp } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CommunityDetail } from "@/utils/constants";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function CommunityPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [communityDetails, setCommunityDetails] = useState<CommunityDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const [viewSecret, setViewSecret] = useState(false);
    const [isMember, setIsMember] = useState(false);

    const { userAddress } = useApp();

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

                // const controller = new AbortController();
                // const timeout = setTimeout(() => controller.abort(), 15_000); // 15 seconds timeout

                let res;
                try {
                    res = await fetch(`/api/community/get-community?${params}`, {
                        // signal: controller.signal,
                    });
                } finally {
                    // clearTimeout(timeout);
                }

                const json = await res.json();
                if (!res.ok) throw new Error(json.error ?? "Failed to load communities");

                const details = json.community as CommunityDetail;
                setIsMember(Boolean(details?.isMember));
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
                    <LoadingSkeleton />
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

                    <section className="flex flex-wrap gap-4 py-4 px-2 sm:px-4">
                        <hgroup className="space-y-2 sm:flex-1">
                            <h1 className="text-2xl fonct-bold">{communityDetails?.name}</h1>
                            <p className="text-primary/60 sm:text-sm text-xs">{communityDetails?.description}
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Doloribus, facere veniam. Consectetur eum quidem repudiandae fugit esse ad magnam mollitia hic, ipsum, ut delectus dolores vel. Obcaecati, temporibus voluptatem impedit doloribus beatae ducimus laudantium quo? Nemo laborum sed ut aut corporis quis veniam, nihil a quia. Repudiandae temporibus modi qui?
                            </p>
                        </hgroup>

                        <Badge variant={"secondary"} className="">{communityDetails?.membersCount} Member{communityDetails?.membersCount !== 1 ? "s" : ""}</Badge>
                    </section>

                    <Separator className="my-2" />

                    <section className="px-2 sm:px-4 py-4 space-y-4">
                        <h3 className="text-lg font-bold">Rules</h3>

                        {
                            communityDetails?.guidelines && communityDetails?.guidelines.length > 0 ? (
                                <ul className=" space-y-1 *:text-primary/60 *:text-sm">
                                    {
                                        communityDetails.guidelines.map((rule) => <li key={rule.slice(0, 2)}> &bull; {rule}</li>)
                                    }
                                </ul>
                            ) :
                                (
                                    <p className="text-muted">No Rule attached to this community</p>
                                )
                        }
                    </section>

                    <Separator className="my-2" />


                    <section className="px-2 sm:px-4 py-4 space-y-4">
                        <hgroup>
                            <h3 className="text-lg font-bold">Members Only Content</h3>
                            <p className="text-primary/60 text-sm">Click the button below to view hidden content</p>
                        </hgroup>


                        {isMember && (
                            <div className="flex gap-2">
                                <p className={cn("px-4 py-3 blur-sm border rounded-sm text-primary/70 pointer-events-none", {
                                    "blur-0 pointer-events-auto": viewSecret && isMember
                                })}>{communityDetails?.hiddenLink}</p>
                                <Button variant={"outline"} onClick={() => setViewSecret((prev) => !prev)} className="h-auto" disabled={!isMember}>
                                    {viewSecret ?
                                        (<>
                                            <EyeOffIcon /> Hide
                                        </>) : (<>
                                            <EyeIcon /> View
                                        </>)}
                                </Button>
                            </div>

                        )}

                        {!isMember && (
                            <div>
                                <CommunityCardJoinButton communityId={String(communityDetails?.communityID)} creatorAddress={String(communityDetails?.creatorAddress)} mintPrice={Number(communityDetails?.mintPrice)} />
                            </div>
                        )}
                    </section>

                </article>
            )}
        </>
    );
};

function LoadingSkeleton() {
    return (
        <article>
            <section className="flex flex-wrap gap-4 py-4 px-2 sm:px-4">
                <hgroup className="space-y-2 sm:flex-1">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-full max-w-3xl" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                    <Skeleton className="h-4 w-2/3 max-w-xl" />
                </hgroup>

                <Skeleton className="h-6 w-28 rounded-full" />
            </section>

            <Separator className="my-2" />

            <section className="px-2 sm:px-4 py-4 space-y-4">
                <Skeleton className="h-7 w-20" />

                <div className="space-y-2">
                    <Skeleton className="h-4 w-full max-w-2xl" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                    <Skeleton className="h-4 w-5/6 max-w-xl" />
                    <Skeleton className="h-4 w-4/5 max-w-lg" />
                </div>
            </section>

            <Separator className="my-2" />

            <section className="px-2 sm:px-4 py-4 space-y-4">
                <hgroup className="space-y-2">
                    <Skeleton className="h-7 w-52" />
                    <Skeleton className="h-4 w-64" />
                </hgroup>

                <div className="flex gap-2">
                    <Skeleton className="h-12 flex-1 max-w-md rounded-sm" />
                    <Skeleton className="h-12 w-24 rounded-md" />
                </div>
            </section>
        </article>
    )
}
