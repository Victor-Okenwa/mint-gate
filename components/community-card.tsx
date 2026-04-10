
import { cn } from "@/lib/utils"
import { ClassValue } from "class-variance-authority/types"
import { useCallback, useState, type HTMLAttributes, type ReactNode } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import Link from "next/link"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { ccc } from "@ckb-ccc/connector-react"
import { toast } from "sonner"

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

export function CommunityCardHeader({ className, title, isMember, ...props }: { className?: ClassValue, title: string, isMember: boolean } & HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex items-start justify-between", className)} {...props}>
            <h3 className="text-base font-semibold">{title}</h3>
            {isMember && (
                <Badge variant="outline" className="text-xs">Member</Badge>
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

export function CommunityCardJoinButton({ className, mintPrice, creatorAddress, ...props }: { className?: ClassValue, mintPrice: number, creatorAddress: string } & HTMLAttributes<HTMLButtonElement>) {
    const [isOpen, setIsOpen] = useState(false);

    const cccClient = ccc.useCcc();

    const handleJoin = useCallback(async () => {
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

        console.log(tx)
    }, [cccClient, mintPrice, creatorAddress]);

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
                    <AlertDialogAction onClick={handleJoin}>Join</AlertDialogAction>
                </AlertDialogFooter>
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