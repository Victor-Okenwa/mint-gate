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
import { ckbToShannons, ckbToShannonsHex } from "@/lib/ckb/xudt";

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
        setIsSubmitting(true);
        try {
            const balance = await signer?.getBalance();

            const creatorAddress =
                await signer?.getRecommendedAddress();

           if (!balance || !creatorAddress) {
            toast.error("Please connect your wallet to continue");
            return;
           }

            if (balance < ckbToShannons(151)) {
                toast.error("You need at least 151 CKB to deploy a community");
                return;
            }


            /*
            const createCommunityResponse = await fetch("/api/community/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name,
                    description: values.description,
                    guidelines: values.guidelines || "",
                    mint_price: values.mintPrice || "0",
                    creator_address: creatorAddress,
                }),
            });

            if (!createCommunityResponse.ok) {
                const text = await createCommunityResponse.text();
                throw new Error("Failed to create community: " + text);
            }

            const body = await createCommunityResponse.json();
            const community = body.community;
            const typeScript = body.typeScript;
            setIsDeploying(true);


            const capacityHex = ckbToShannonsHex(150);

            const lock = (await signer!.getRecommendedAddressObj()).script;

            const output = {
                lock,
                type: typeScript,
                capacity: capacityHex,
                data: "0x",
            };

            const unsignedTx = ccc.Transaction.from({ outputs: [output] });

            await unsignedTx.completeInputsByCapacity(signer!);
            await unsignedTx.completeFeeBy(signer!);

            const signedTx = await signer?.signTransaction(unsignedTx);

            const txHash = await signer?.sendTransaction(signedTx);

            console.log(txHash);

            const deployCommunityResponse = await fetch("/api/community/deploy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ communityId: community.id }),
            });

            console.log(deployCommunityResponse);

            if (!deployCommunityResponse.ok) {
                toast.error("Failed to deploy community");
                return;
            }

            const saved = await deployCommunityResponse.json()
            console.log(saved)
            toast.success("Community deployed successfully");
            */
            // router.push("/dashboard/");
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : "Something went wrong";
            if (message.toLowerCase().includes("capacity") || message.toLowerCase().includes("insufficient")) {
                toast.error("Insufficient CKB balance. You need at least 150 CKB plus fees.");
            } else {
                toast.error(message);
            }
        } finally {
            setIsSubmitting(false);
            setIsDeploying(false);
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
