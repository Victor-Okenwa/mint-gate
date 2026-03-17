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
import { ckbToShannons, ckbToShannonsHex, generateCommunityId } from "@/lib/ckb/xudt";
import { utf8ToHex } from "@/lib/ckb/hash";

export const formSchema = z.object({
    name: z.string().min(1, "Community name is required"),
    description: z.string().min(1, "Description is required"),
    guidelines: z.string().optional(),
    mintPrice: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateCommunityPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    // const router = useRouter();
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
        const communityId = generateCommunityId();


        setIsSubmitting(true);
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
            
            if (balance < ckbToShannons(151)) {
                toast.error("Insufficient balance (min 151 CKB)");
                return;
            }

            
            const communityData = {
                id: communityId,
                name: values.name,
                description: values.description,
                creatorAddress
            };

            const dataHex = utf8ToHex(JSON.stringify(communityData));

            const capacityHex = ckbToShannonsHex(145);

            // ✅ build tx (NO TYPE SCRIPT)
            const unsignedTx = ccc.Transaction.from({
                outputs: [
                    {
                        capacity: capacityHex,
                        lock: addressObj.script,
                        type: undefined,
                    },
                ],
                outputsData: [dataHex],
            });

            await unsignedTx.completeInputsByCapacity(signer);
            await unsignedTx.completeFeeBy(signer);

            const signedTx = await signer.signTransaction(unsignedTx);
            const txHash = await signer.sendTransaction(signedTx);

            console.log("Community deployed:", txHash);

            // ✅ call backend to store metadata
            await fetch("/api/community/create", {
                method: "POST",
                body: JSON.stringify({
                    id: communityId,
                    name: values.name,
                    description: values.description,
                    creatorAddress: creatorAddress,
                    txHash,
                }),
            });

            toast.success("Community created successfully 🚀");
        } catch (error: unknown) {
            console.error("handleSubmit error:", error);
            const msg = (error as Error)?.message ?? String(error);
            if (msg.toLowerCase().includes("capacity") || msg.toLowerCase().includes("insufficient")) {
                toast.error("Insufficient CKB balance. You need about 145 CKB plus fees.");
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
            <p className="text-sm text-muted-foreground mb-10">Deploy a new on-chain membership community.</p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full mt-4"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner className="size-5" />
                                {isDeploying ? "Deploying…" : "Uploading data…"}
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
