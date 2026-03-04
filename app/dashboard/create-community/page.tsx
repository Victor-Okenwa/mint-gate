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
import { createCommunityObject } from "@/lib/ckb/community";
import { ccc } from "@ckb-ccc/connector-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const formSchema = z.object({
    name: z.string().min(1, "Community name is required"),
    description: z.string().min(1, "Description is required"),
    guidelines: z.string().optional(),
    mintPrice: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateCommunityPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        const mintPriceCkb =
            values.mintPrice === "" ? 0 : Number(values.mintPrice)

        setIsSubmitting(true)

        try {
            const creatorAddress =
                await signer?.getRecommendedAddress()

            if (!creatorAddress) {
                throw new Error("Wallet not connected")
            }

            const community = createCommunityObject(
                creatorAddress,
                values.name,
                values.description,
                values.guidelines || "",
                mintPriceCkb.toString()
            )

            const response = await fetch("/api/communities", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: community.id,
                    name: community.name,
                    description: community.description,
                    guidelines: community.guidelines,
                    mint_price: community.mintPrice,
                    creator_address: creatorAddress,
                    type_script: community.udtTypeScript,
                }),
            })

            if (!response.ok) {
                toast.error("Failed to save community")
                throw new Error("Failed to save community")
            }

            const saved = await response.json()

            console.log("Saved:", saved)
            toast.success("Community saved successfully");
            router.push("/dashboard/");
        } catch (err) {
            console.error(err)
        } finally {
            setIsSubmitting(false)
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
                                Deploying…
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
