import { ccc } from "@ckb-ccc/connector-react";
import { ClassValue } from "clsx";
import React, { createContext, useContext, useEffect, useState } from "react";
import { truncateAddress } from "../utils/stringUtils";
import { cn } from "@/lib/utils";

interface WalletConnectContextProps {
  balance: string;
  setBalance: React.Dispatch<React.SetStateAction<string>>;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  open: () => unknown
  wallet: ccc.Wallet | undefined
}

const initialWalletConnectState: WalletConnectContextProps = {
  balance: "",
  setBalance: () => { },
  address: "",
  setAddress: () => { },
  open: () => { },
  wallet: undefined
};


//  Context for store
const WalletConnectContext = createContext<WalletConnectContextProps>(initialWalletConnectState);

function useWalletConnect() {
  const context = useContext(WalletConnectContext);
  if (!context) throw new Error("Wallet connect components must be used within <WalletConnect />");
  return context;
}

export function WalletConnect({ children }: { children: React.ReactNode }) {
  const { open, wallet } = ccc.useCcc();
  const [balance, setBalance] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const signer = ccc.useSigner();

  useEffect(function () {
    if (!signer) {
      return;
    }
    (async function () {
      const [address, capacity] = await Promise.all([
        signer.getRecommendedAddress(),
        signer.getBalance()
      ]
      );

      setAddress(address)
      setBalance(ccc.fixedPointToString(capacity));
    })();
  }, [signer]);

  const values = {
    balance,
    setBalance,
    address,
    setAddress,
    open,
    wallet
  }

  return (
    <WalletConnectContext.Provider value={values}>
      {children}
    </WalletConnectContext.Provider>
  )
}

export function WalletConnectButton({
  className = ""
}: {
  className?: ClassValue
}) {
  const { open, wallet } = useWalletConnect();

  if (wallet) return null;

  return (
    <button className={cn("cursor-pointer rounded-full border border-solid border-transparent transition-colors flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-90  text-sm sm:text-base font-bold  px-5 py-3", className)}
      onClick={open}
    >
      Connect Wallet
    </button>
  )
}

export function WalletConnectInfoContainer({ children, className = ""
}: {
  children: React.ReactNode;
  className?: ClassValue
}) {
  const { open, wallet } = useWalletConnect();

  if (!wallet) return null;
  return (
    <button className={cn("cursor-pointer rounded-full border border-solid border-transparent transition-colors bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-sm sm:text-base font-bold px-5 py-3", className)}
      onClick={open}>
      {children}
    </button>
  )
}

export function WalletConnectInfoImage({ className = ""
}: {
  className?: ClassValue
}) {
  const { wallet } = useWalletConnect();

  if (!wallet) return null;

  return (
    <img src={wallet.icon} alt="avatar" className={cn("w-6 h-6", className)} />
  )
}

type DecimalPlaces = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export function WalletConnectInfoBalance({ className = "",
  decimalPlaces,
  withCurrency = true
}: {
  decimalPlaces?: DecimalPlaces;
  withCurrency?: boolean;
  className?: ClassValue
}) {
  const { wallet, balance } = useWalletConnect();

  if (!wallet) return null;

  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimalPlaces, // Controls decimal places
    roundingMode: 'trunc',    // Forces it to cut off instead of rounding up
  });

  return (
    <h3 className={cn("font-semibold text-sm", className)}>{decimalPlaces !== undefined ? formatter.format(Number(balance)) : balance}
      {withCurrency &&
        <span>
          {" "}
          CKB
        </span>}
    </h3>
  )
}

export function WalletConnectInfoAddress({ className = "",
  frontChars = 10,
  endChars = 6,
}: {
  className?: ClassValue;
  frontChars?: number,
  endChars?: number,
}) {
  const { wallet, address } = useWalletConnect();

  if (!wallet) return null;

  return (
    <span className={cn("text-xs font-normal", className)}>
      {truncateAddress(address, frontChars, endChars)}
    </span>
  )
}
