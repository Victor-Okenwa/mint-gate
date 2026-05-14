import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ccc } from "@ckb-ccc/connector-react";

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
