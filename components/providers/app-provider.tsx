"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { createContext, useContext, useEffect, useState, type JSX, type ReactNode } from "react";

interface AppContextType {
    isConnected: boolean;
    setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
    // Add other methods/values to context interface
}


interface AppProviderProps {
    children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export default function AppProvider({ children }: AppProviderProps): JSX.Element {
    const [isConnected, setIsConnected] = useState(false);
    const signer = ccc.useSigner();

    useEffect(() => {
        if (!signer) return;
        async function checkIsConnected() {
            const isSigned = await signer?.isConnected();
            setIsConnected(isSigned || false);
        }
        checkIsConnected();
    }, [signer]);


    // Add your custom functions here

    const value: AppContextType = {
        isConnected,
        setIsConnected,
        // Add other values/functions to expose
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