
import { cn } from "@/lib/utils"
import { ClassValue } from "class-variance-authority/types"
import { useCallback, useState, type HTMLAttributes, type ReactNode } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import Link from "next/link"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { ccc } from "@ckb-ccc/connector-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { LoadingSwap } from "./ui/loading-swap"
import { useApp } from "./providers/app-provider"
import { Spinner } from "./ui/spinner"

export function CommunityCard({
    children,
    className,
    ...props
}: { children: ReactNode, className?: ClassValue } & HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("border border-border p-6 space-y-4 hover:bg-secondary/30 transition-colors", className)}
            {...props}
        >
            {children}
        </div>
    )
}

export function CommunityCardHeader({ className, title, isMember, isCreator, ...props }: { className?: ClassValue, title: string, isMember: boolean, isCreator: boolean } & HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex items-start justify-between", className)} {...props}>
            <h3 className="text-base font-semibold">{title}</h3>
            {(isMember || isCreator) && (
                <Badge variant="outline" className={cn("text-xs", {
                    "border-yellow-500": isCreator
                })}>{isCreator ? "Creator" : "Member"}</Badge>
            )}
        </div>
    )
}

export function CommunityCardDescription({ className, description, ...props }: { className?: ClassValue, description: string } & HTMLAttributes<HTMLDivElement>) {
    return (
        <p className={cn("text-sm text-muted-foreground leading-relaxed", className)} {...props}>
            {description}
        </p>
    )
}

export function CommunityCardMemberCount({ className, count, ...props }: { className?: ClassValue, count: number } & HTMLAttributes<HTMLDivElement>) {
    return (
        <span className={cn("text-xs text-muted-foreground", className)} {...props}>
            {count} members
        </span>
    )
}

export function CommunityCardMintPrice({ className, price, ...props }: { className?: ClassValue, price: number } & HTMLAttributes<HTMLDivElement>) {
    return (
        <span className={cn("text-xs text-muted-foreground", className)} {...props}>
            {price} CKB
        </span>
    )
}

export function CommunityCardViewButton({ className, href, ...props }: { className?: ClassValue, href: string } & HTMLAttributes<HTMLButtonElement>) {
    return (
        <Button variant="outline" size="sm" className={cn(className)} asChild {...props}>
            <Link href={href}>View</Link>
        </Button>
    )
}

export function CommunityCardJoinButton({ className, mintPrice, communityId, creatorAddress, ...props }: { className?: ClassValue, mintPrice: number, communityId: string, creatorAddress: string } & HTMLAttributes<HTMLButtonElement>) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { cccClient, signer, userAddress } = useApp();

    const router = useRouter();

    const handleJoin = useCallback(async () => {

        try {
            setIsLoading(true);
            if (!signer) {
                toast.error("Connect wallet first");
                return;
            }

            if (!creatorAddress) {
                toast.error("Community creator address not found");
                return;
            }

            if (!communityId) {
                toast.error("Community not found");
                return;
            }

            const { script: toLock } = await ccc.Address.fromString(creatorAddress, cccClient.client);

            const tx = ccc.Transaction.from({
                outputs: [{ lock: toLock }],
                outputsData: [],
            });

            tx.outputs.forEach((output, i) => {
                if (output.capacity > ccc.fixedPointFrom(mintPrice)) {
                    toast.error(`Insufficient balance: ${output.capacity} < ${mintPrice} CKB at ${i}`);
                    return;
                }

                output.capacity = ccc.fixedPointFrom(mintPrice);
            });

            // Complete missing parts for transaction
            await tx.completeInputsByCapacity(signer!);
            await tx.completeFeeBy(signer!, 1000);

            const txHash = await signer?.sendTransaction(tx);

            if (!txHash) {
                toast.error("Failed to join community, try again.");
                return;
            }

            const response = await fetch("/api/community/join-community", {
                method: "POST",
                body: JSON.stringify({
                    community_id: communityId,
                    user_address: userAddress,
                    tx_hash: txHash,
                }),
            });

            if (!response.ok) {
                toast.error(await response.text() ?? "Failed to join community, try again.");
                return;
            }

            setIsOpen(false);
            toast.success("Joined community successfully", {
                duration: 7000,
                action: {
                    label: "View Community",
                    onClick: () => router.replace(`/community/${communityId}`),
                },
            });
            router.replace(`/community/${communityId}`);
        } catch (error) {
            console.error(error);
            toast.error((error as Error).message || "Failed to join community, try again.");
        } finally {
            setIsLoading(false);
        }
    }, [signer, creatorAddress, communityId, cccClient.client, userAddress, router, mintPrice]);

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="default" size="sm" className={cn(className)} {...props}>
                    Join
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Join the community</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    Joining this community will cost you {mintPrice} CKB.
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={handleJoin} disabled={isLoading}>
                        <LoadingSwap isLoading={isLoading}>Join</LoadingSwap>
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function CommunityCardDeleteButton({ className, communityId, communityName, isCreator, ...props }: { className?: ClassValue, communityId: string, communityName: string, isCreator: boolean } & HTMLAttributes<HTMLButtonElement>) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signer, userAddress } = useApp();
    const [deleteState, setDeleteState] = useState<'initializing' | 'verifying & deleting' | 'verify & delete'>("verify & delete");

    const router = useRouter();

    const handleDelete = useCallback(async () => {
        try {
            setIsLoading(true);
            setDeleteState("initializing")
            if (!signer) {
                toast.error("Connect wallet first");
                return;
            }

            if (!communityId) {
                toast.error("Community not found");
                return;
            }

            const params = new URLSearchParams({
                community_id: communityId,
                user_address: userAddress
            });

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 25_000); // 25 seconds timeout
            setDeleteState("verifying & deleting");

            let res;
            try {
                res = await fetch(`/api/community/delete?${params}`, {
                    method: "DELETE",
                    signal: controller.signal,
                });
            } finally {
                clearTimeout(timeout);
            }

            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Failed to load communities");

            toast.success("Community deleted successfully")
            location.reload()

            setIsOpen(false);
        } catch (error) {
            console.log(error as Error);
            toast.error((error as Error).message || "Failed to delete community, try again.");
        }
        finally {
            setIsLoading(false);
            setDeleteState("verify & delete")
        }
    }, [signer, communityId, userAddress, router]);

    if (!isCreator) {
        return null;
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className={cn(className)} {...props}>
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete {communityName}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this community? It will be permanently deleted from our records  and cannot be recovered.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <section>
                    <h1>Steps to delete your community:</h1>
                    <ol>
                        <li className="flex items-start gap-2">
                            <span className="text-sm text-muted-foreground">1.</span>
                            <p className="text-sm text-muted-foreground">
                                <b>Verify onchain ownership.</b> This will ensure that you are the sole owner of the community.
                                We will check this by verifying the community creator address onchain.
                            </p>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-sm text-muted-foreground">2.</span>
                            <p className="text-sm text-muted-foreground">
                                <b>Delete the community from the dashboard and communities page.</b> This will remove the community from the dashboard and make it unavailable to users.
                            </p>
                        </li>
                    </ol>
                </section>

                <div className="flex justify-end gap-2">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant={"destructive"} onClick={handleDelete} disabled={isLoading} className="capitalize">
                        {isLoading && <Spinner />} {deleteState}
                    </Button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function CommunityCardActions({ className, children, ...props }: { className?: ClassValue, children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex items-center gap-2 pt-2", className)} {...props}>
            {children}
        </div>
    )
}