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
import { ccc, Script } from "@ckb-ccc/connector-react";
import { toast } from "sonner";
import { ckbToShannons, ckbToShannonsHex, generateCommunityIdAndTypeScript } from "@/lib/ckb/xudt";
import { generateCommunityTypeScript } from "@/lib/ckb/udt";

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
        // setIsSubmitting(true);
        console.log("values:", values);

        try {
            if (!signer) {
                toast.error("Please connect your wallet to continue");
                return;
            }

            const balance = await signer.getBalance();
            const creatorAddress = await signer.getRecommendedAddress();
            if (!balance || !creatorAddress) {
                toast.error("Please connect your wallet to continue");
                return;
            }

            if (balance < ckbToShannons(151)) {
                toast.error("You need at least 151 CKB to deploy a community");
                return;
            }

            setIsDeploying(true);

            // generate id + typeScript locally (you said this is ok)
            const { id: communityId, typeScript } = generateCommunityIdAndTypeScript();

            // quick validation
            console.log("typeScript:", typeScript);
            if (!typeScript?.codeHash || !typeScript.args) {
                throw new Error("Invalid typeScript generated (missing fields).");
            }
            if (!/^0x[0-9a-fA-F]+$/.test(typeScript.codeHash)) {
                throw new Error("Invalid codeHash format: " + String(typeScript.codeHash));
            }

            // prepare lock & output
            const lock = (await signer.getRecommendedAddressObj()).script;
            const capacityHex = ckbToShannonsHex(145); // or 130/150 per your risk tolerance

            const output = {
                capacity: capacityHex,
                lock,
                type: undefined,
                data: ccc.hexFrom,
            };

            // IMPORTANT: include xUDT cell dep up front. DO NOT mutate unsignedTx.cellDeps later.
            // const XUDT_DEPLOY_TX_HASH = "0xREPLACE_WITH_REAL_XUDT_DEPLOY_TX_HASH"; // <-- replace this
            const xudtCellDep = {
                outPoint: {
                    txHash: "0x0fab65924f2784f17f3e7d9e9e8b8a2a77b8e2e39f6d9c3e3b8e9e7e4b4a9c7f",
                    index: "0x0",
                },
                depType: "code",
            };

            console.log("Output:", output);
            console.log("Cell dep:", xudtCellDep);

            // Build transaction **including** cellDeps
            const unsignedTx = ccc.Transaction.from({
                outputs: [output],
                // cellDeps: [xudtCellDep],
            });

            // log the transaction skeleton for debugging
            console.log("Unsigned tx (before inputs/fee):", unsignedTx);

            // collect inputs & fee
            await unsignedTx.completeInputsByCapacity(signer);
            await unsignedTx.completeFeeBy(signer);

            // log again so you can inspect inputs and cellDeps
            console.log("Unsigned tx (ready to sign):", unsignedTx);
            console.log("unsignedTx.cellDeps:", unsignedTx.cellDeps);

            // sign & send
            const signedTx = await signer.signTransaction(unsignedTx);
            console.log("signedTx:", signedTx);

            const txHash = await signer.sendTransaction(signedTx);
            console.log("Deployment txHash:", txHash);

            // persist community after successful chain broadcast (call your /api/community/deploy)
            // const saveRes = await fetch("/api/community/deploy", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({
            //         id: communityId,
            //         name: values.name,
            //         description: values.description,
            //         guidelines: values.guidelines || [],
            //         mint_price: values.mintPrice || "0",
            //         creator_address: creatorAddress,
            //         type_script: typeScript,
            //         deployment_tx_hash: txHash,
            //     }),
            // });

            // if (!saveRes.ok) {
            //     console.warn("Failed to save community after tx:", await saveRes.text());
            //     toast.error("Deployed but failed to save community metadata.");
            // } else {
            //     const saved = await saveRes.json();
            //     console.log("Saved community:", saved);
            //     toast.success("Community deployed and saved");
            // }
        } catch (error: any) {
            console.error("handleSubmit error:", error);
            const msg = error?.message ?? String(error);
            if (msg.toLowerCase().includes("capacity") || msg.toLowerCase().includes("insufficient")) {
                toast.error("Insufficient CKB balance. You need about 145 CKB plus fees.");
            } else {
                // show the raw message to help debugging
                toast.error(msg);
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
