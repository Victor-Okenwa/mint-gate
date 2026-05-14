"use client";
import { ccc } from "@ckb-ccc/connector-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const signer = ccc?.useSigner();
    const router = useRouter();

    useEffect(() => {
        const checkIsConnected = async () => {
            await signer?.isConnected().then((isConnected) => {
                if (!isConnected) {
                    router.push("/");
                }
            });
        }
        checkIsConnected();
    }, [signer, router]);

    return (
        <main className="flex-1 w-full">
            {children}
        </main>
    );
}
