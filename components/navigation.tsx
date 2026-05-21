import Link from "next/link";
import { Button } from "./ui/button";
import { WalletConnect, WalletConnectButton } from "./ConnectWallet";
import { SidebarTrigger } from "./ui/sidebar";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Input } from "./ui/input";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const searchSchema = z.object({
    search: z.string().min(2, { message: "Search must be at least 2 characters" }),
});

type SearchSchema = z.infer<typeof searchSchema>;

/**
 * Navigation component
 * @returns React.ReactNode
 */
export function Navigation({ isConnected }: { isConnected: boolean }) {
    const searchForm = useForm<SearchSchema>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            search: ''
        },
    })


    async function handleSearch() {

    }

    return (
        <nav className="sticky top-0 flex bg-background/80 backdrop-blur-md items-center justify-between px-8 py-6 border-b border-border w-full" >
            {isConnected ? (
                <SidebarTrigger />
            ) : (
                <Link href="/" className="text-sm font-semibold tracking-widest uppercase">Mint Gate</Link>
            )}

            <Form {...searchForm}>
                <form onSubmit={searchForm.handleSubmit(handleSearch)} className="flex" method="GET">
                    <FormField
                        control={searchForm.control}
                        name="search"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. Nervos Builders"
                                        className="bg-secondary border-border"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button
                        className="rounded-s-none rounded-e-full"
                        type="submit"
                        disabled={!searchForm.formState.isValid}
                    >
                        <SearchIcon />
                    </Button>

                </form>
            </Form>

            {isConnected ? (
                <div className="flex items-center gap-2">
                    <Button asChild><Link href="/create-community"> <PlusIcon /> Create </Link></Button>
                </div>
            ) : (
                <WalletConnect>
                    <WalletConnectButton />
                </WalletConnect>
            )}
        </nav >
    );
}
