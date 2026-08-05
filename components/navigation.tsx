import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { WalletConnect, WalletConnectButton } from "./ConnectWallet";
import { SidebarTrigger } from "./ui/sidebar";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Input } from "./ui/input";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useApp } from "./providers/app-provider";

export const searchSchema = z.object({
    search: z.string().min(2, { message: "Search must be at least 2 characters" }),
});

type SearchSchema = z.infer<typeof searchSchema>;

/**
 * Navigation component
 * @returns React.ReactNode
 */
export function Navigation({ isConnected }: { isConnected: boolean }) {
    return (
        <nav className="sticky top-0 flex bg-background/80 backdrop-blur-md items-center justify-between px-8 py-6 border-b border-border w-full z-50" >
            {isConnected ? (
                <SidebarTrigger />
            ) : (
                <Link href="/" className="text-sm font-semibold tracking-widest uppercase">Mint Gate</Link>
            )}

            <SearchImleplentation />

            {isConnected ? (
                <div className="flex items-center gap-2">
                    <Button asChild><Link href="/create-community" className="rounded-none h-10"> <PlusIcon /> <span className="max-sm:hidden">Create</span> </Link></Button>
                </div>
            ) : (
                <WalletConnect>
                    <WalletConnectButton size="lg" className="text-sm! rounded-none h-10" />
                </WalletConnect>
            )}
        </nav >
    );
}

function SearchForm() {
    const router = useRouter();
    const { userAddress } = useApp();
    const searchForm = useForm<SearchSchema>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            search: ''
        },
    })

    async function handleSearch() {
        const value = searchForm.getValues("search");

        const params = new URLSearchParams({ search: value.trim(), userAddress });
        if (value.trim()) {
            router.push(`/search?${params.toString()}`);
        }
    }

    return (
        <Form {...searchForm}>
            <form onSubmit={searchForm.handleSubmit(handleSearch)} className="flex" method="GET">
                <FormField
                    control={searchForm.control}
                    name="search"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder="Search for communities"
                                    className="bg-secondary border-border outline-hidden! rounded-e-none rounded-s-none"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button
                    className="rounded-none"
                    type="submit"
                    disabled={!searchForm.formState.isValid}
                >
                    <SearchIcon />
                </Button>
            </form>
        </Form>
    )

}

function SearchImleplentation() {

    return (
        <div>
            <div className="max-sm:hidden">
                <SearchForm />
            </div>

            <AlertDialog>
                <AlertDialogTrigger asChild className="sm:hidden">
                    <Button className="rounded-none"><SearchIcon /></Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="*:w-full">

                    <AlertDialogHeader>

                        <AlertDialogCancel className="w-fit absolute right-5 top-0">
                            <XIcon />
                        </AlertDialogCancel>

                        <AlertDialogTitle>
                            <h3>Search</h3>
                        </AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="flex justify-center">
                        <SearchForm />
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )

}