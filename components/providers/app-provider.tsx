"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState, type JSX, type ReactNode } from "react";

interface CCCType {
    isOpen: boolean;
    open: () => unknown;
    close: () => unknown;
    disconnect: () => unknown;
    setClient: (client: ccc.Client) => unknown;
    client: ccc.Client;
    wallet?: ccc.Wallet;
    signerInfo?: ccc.SignerInfo;
}

interface AppContextType {
    cccClient: CCCType;
    signer: ccc.Signer | undefined;
    userAddress: string
    setUserAddress: Dispatch<SetStateAction<string>>

    isConnected: boolean;
    setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;

    // Add other methods/values to context interface
}


interface AppProviderProps {
    children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export default function AppProvider({ children }: AppProviderProps): JSX.Element {
    const cccClient = ccc.useCcc();
    const signer = ccc.useSigner();

    const [isConnected, setIsConnected] = useState(false);
    const [userAddress, setUserAddress] = useState("")


    useEffect(() => {
        if (!signer) return;
        async function checkIsConnectedAndAddAddress() {
            const isSigned = await signer?.isConnected();
            setIsConnected(isSigned || false);

            if (!isSigned) return;

            const address = await signer?.getRecommendedAddress();
            setUserAddress(address!);
            console.log(userAddress)

        }
        checkIsConnectedAndAddAddress();
    }, [signer, userAddress]);



    const value: AppContextType = {
        cccClient,
        signer,

        userAddress,
        setUserAddress,
        isConnected,
        setIsConnected,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp(): AppContextType {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within a AppProvider");
    }
    return context;
};