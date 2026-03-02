export interface Community {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    mintPrice: number;
    rules: string;
    members: string[];
}

export const mockCommunities: Community[] = [
    {
        id: "nervos-builders",
        name: "Nervos Builders",
        description: "Core developers and contributors building on Nervos CKB.",
        memberCount: 342,
        mintPrice: 100,
        rules: "Must hold at least 1000 CKB. Active contribution required.",
        members: [
            "ckb1qyq...a3f2",
            "ckb1qyq...b7d1",
            "ckb1qyq...c9e4",
            "ckb1qyq...d2f8",
            "ckb1qyq...e5a1",
        ],
    },
    {
        id: "cell-model-research",
        name: "Cell Model Research",
        description: "Research group focused on UTXO-based smart contract patterns.",
        memberCount: 128,
        mintPrice: 50,
        rules: "Open to all researchers. Peer review participation expected.",
        members: [
            "ckb1qyq...f1b3",
            "ckb1qyq...g4c6",
            "ckb1qyq...h8d2",
        ],
    },
    {
        id: "ckb-governance",
        name: "CKB Governance",
        description: "On-chain governance proposals and voting for the Nervos ecosystem.",
        memberCount: 891,
        mintPrice: 200,
        rules: "Minimum 5000 CKB stake. One address, one vote.",
        members: [
            "ckb1qyq...i2e5",
            "ckb1qyq...j6f9",
        ],
    },
    {
        id: "layer2-explorers",
        name: "Layer 2 Explorers",
        description: "Exploring rollups, state channels, and scaling solutions on CKB.",
        memberCount: 76,
        mintPrice: 25,
        rules: "Open membership. Participate in monthly calls.",
        members: [],
    },
    {
        id: "defi-on-ckb",
        name: "DeFi on CKB",
        description: "Decentralized finance protocols and liquidity on Nervos.",
        memberCount: 214,
        mintPrice: 150,
        rules: "Protocol builders and liquidity providers.",
        members: [
            "ckb1qyq...k3g7",
        ],
    },
    {
        id: "open-standards",
        name: "Open Standards DAO",
        description: "Defining interoperability standards for CKB-based applications.",
        memberCount: 53,
        mintPrice: 0,
        rules: "Free to join. Consensus-based decision making.",
        members: [],
    },
];

export const userMemberships = ["nervos-builders", "ckb-governance", "defi-on-ckb"];
