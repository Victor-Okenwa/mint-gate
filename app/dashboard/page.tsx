"use client";

import { mockCommunities, userMemberships } from "@/lib/mock-data";
import { CommunityCard, CommunityCardActions, CommunityCardDescription, CommunityCardJoinButton, CommunityCardViewButton, CommunityCardHeader, CommunityCardMemberCount, CommunityCardMintPrice } from "@/components/community-card";

export default function DashboardPage() {

    

    return (
        <main className="flex-1 p-6">
            <h2 className="text-xl font-semibold mb-8 tracking-tight">My Memberships</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userMemberships.length > 0 ? mockCommunities.map((community) => {
                    const isMember = userMemberships.includes(community.id);
                    return (
                        <CommunityCard key={community.id}>
                            <CommunityCardHeader title={community.name} isMember={isMember} />
                            <CommunityCardDescription description={community.description} />
                            <CommunityCardMemberCount count={community.memberCount} />
                            &nbsp;
                            <CommunityCardMintPrice price={community.mintPrice} className="text-foregorund" />

                            <CommunityCardActions>
                                <CommunityCardViewButton href={`/community/${community.id}`} />
                                {!isMember && (
                                    <CommunityCardJoinButton />
                                )}
                            </CommunityCardActions>
                        </CommunityCard>
                    );
                }) : <div className="text-center text-muted-foreground">No memberships found</div>}
            </div>
        </main>
    );
}
