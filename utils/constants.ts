export type CommunityDetail = {
    communityID: string;
    name: string;
    description: string;
    guidelines: string[];
    mintPrice: number;
    creatorAddress: string;
    hiddenLink: string | null;
    txHash: string | null;
    isMember: boolean;
    membersCount: number;
};

export const PAGE_SIZE = 10;
