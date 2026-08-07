"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ccc } from "@ckb-ccc/connector-react";
import { toast } from "sonner";
import { generateCommunityId } from "@/lib/ckb/xudt";
import {
    buildCommunityCellData,
    computeCommunityCellCapacityShannons,
    CREATE_FEE_BUFFER_CKB,
    encodeCommunityCellData,
} from "@/lib/ckb/community-cell";
import { InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isValidHiddenLinkRawInput } from "@/lib/hidden-link";

const WEBSITE_PREFIX = "https://";

const formSchema = z.object({
    name: z.string().min(1, "Community name is required"),
    description: z.string().min(1, "Description is required"),
    guidelines: z.string().optional(),
    hiddenLink: z
        .string()
        .max(100)
        .refine((val) => isValidHiddenLinkRawInput(val), {
            message:
                "Omit https:// — use a host like example.com or www.example.com.lk, optional /path/segments (letters, digits, ._~-)",
        })
        .transform((val) => {
            const trimmed = val.trim();
            return trimmed ? `${WEBSITE_PREFIX}${trimmed}` : "";
        }),
    mintPrice: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateCommunityPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const router = useRouter();
    const signer = ccc.useSigner();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            guidelines: "",
            mintPrice: "0",
        },
    });

    async function handleSubmit(values: FormValues) {
        setIsSubmitting(true);
        const communityId = generateCommunityId();

        try {
            if (!signer) {
                toast.error("Connect wallet first");
                return;
            }

            const balance = await signer.getBalance();
            const creatorAddress = await signer?.getRecommendedAddress();
            const addressObj = await signer.getRecommendedAddressObj();

            if (!balance || !addressObj) {
                toast.error("Wallet not ready");
                return;
            }

            /**
             * On-chain community Cell data (A1).
             * Must match docs/MEMBERSHIP_SCRIPT.md so the membership Type Script
             * can later read mint price + creator lock via cell_dep on join.
             * Off-chain metadata (name, description, link) still goes to Postgres.
             */
            const creatorLockHash = addressObj.script.hash();
            const communityCellData = buildCommunityCellData({
                communityId,
                creatorLockHash,
                mintPriceCkb: values.mintPrice,
            });
            const dataHex = encodeCommunityCellData(communityCellData);

            /** Occupied capacity from lock + data size (not a fixed 301 CKB). */
            const cellCapacity = computeCommunityCellCapacityShannons(
                addressObj.script,
                dataHex,
            );
            const feeBuffer = ccc.fixedPointFrom(CREATE_FEE_BUFFER_CKB);
            const requiredBalance = cellCapacity + feeBuffer;

            if (balance < requiredBalance) {
                toast.error(
                    `Insufficient balance (need ~${ccc.fixedPointToString(requiredBalance)} CKB: cell capacity + ~${CREATE_FEE_BUFFER_CKB} CKB fee buffer)`,
                );
                return;
            }

            const unsignedTx = ccc.Transaction.from({
                outputs: [
                    {
                        capacity: cellCapacity,
                        lock: addressObj.script,
                        type: undefined,
                    },
                ],
                outputsData: [dataHex],
            });

            await unsignedTx.completeInputsByCapacity(signer);
            await unsignedTx.completeFeeBy(signer, 1000);

            const signedTx = await signer.signTransaction(unsignedTx);
            const txHash = await signer.sendTransaction(signedTx);

            console.log("Community deployed:", txHash, {
                cellCapacityCkb: ccc.fixedPointToString(cellCapacity),
            });

            setIsDeploying(true);


            const response = await fetch("/api/community/create", {
                method: "POST",
                body: JSON.stringify({
                    id: communityId,
                    name: values.name,
                    description: values.description,
                    creator_address: creatorAddress,
                    guidelines: values.guidelines,
                    hidden_link: values.hiddenLink,
                    mint_price: values.mintPrice,
                    tx_hash: txHash,
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            toast.success("Community created successfully 🚀");
            router.push(`/community/${communityId}`);
        } catch (error: unknown) {
            console.error("handleSubmit error:", error);
            const msg = (error as Error)?.message ?? String(error);
            if (msg.toLowerCase().includes("capacity") || msg.toLowerCase().includes("insufficient")) {
                toast.error(
                    "Insufficient CKB balance for cell capacity plus network fees.",
                );
            } else {
                // show the raw message to help debugging
                toast.error(msg);
            }
        } finally {
            setIsDeploying(false);
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-lg mx-auto px-6 py-16">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Create Community</h1>
            <p className="text-sm text-muted-foreground mb-10">
                Deploy a community Cell with on-chain id, creator lock hash, and mint price
                (membership Type Script reads these on join).
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" method="post">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Community Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. Nervos Builders"
                                        className="bg-secondary border-border"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Description
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe the purpose of this community..."
                                        className="bg-secondary border-border min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="guidelines"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Membership Guidelines
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Be respectful.
                                        No spam.
                                        No hate speech.
                                        Follow Discord etiquette."
                                        className="bg-secondary border-border min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="hiddenLink"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormLabel>Hidden Link</FormLabel>

                                    <Tooltip>
                                        <TooltipTrigger><InfoIcon className="size-4" /></TooltipTrigger>
                                        <TooltipContent className="max-w-md text-sm">
                                            This is the sensitive link that is not visible to the public. <br />
                                            It can only be accessed by community members. <br />
                                            It can be a link to a private channel or a private group on Discord, Telegram, etc.
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                https://
                                            </InputGroupAddon>
                                            <InputGroupInput placeholder="example.com, www.example.com/path" className="bg-secondary! border-border" {...field} />
                                        </InputGroup>
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mintPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Mint Price (CKB)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        min={0}
                                        className="bg-secondary border-border"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="text-xs text-muted-foreground flex items-start gap-2 mt-4">
                        <InfoIcon className="size-4 shrink-0 mt-0.5" />
                        <span>
                            On-chain cost is the community Cell&apos;s{" "}
                            <strong>occupied capacity</strong> (sized from lock + stored data)
                            plus network fees.
                        </span>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full mt-4"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner className="size-5" />
                                {isDeploying ? "Deploying…" : "Signing Transaction…"}
                            </>
                        ) : (
                            "Deploy On-Chain"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
