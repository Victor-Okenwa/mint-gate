"use client";

import { mockCommunities, userMemberships } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <main className="flex-1 p-6">
            <h2 className="text-xl font-semibold mb-8 tracking-tight">My Memberships</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userMemberships.length > 0 ? mockCommunities.map((community) => {
                    const isMember = userMemberships.includes(community.id);
                    return (
                        <div
                            key={community.id}
                            className="border border-border p-6 space-y-4 hover:bg-secondary/30 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <h3 className="text-base font-semibold">{community.name}</h3>
                                {isMember && (
                                    <Badge variant="outline" className="text-xs">Member</Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {community.description}
                            </p>
                            <div className="text-xs text-muted-foreground">
                                {community.memberCount} members
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <Link href={`/community/${community.id}`}>
                                        View
                                    </Link>
                                </Button>
                                {!isMember && (
                                    <Button size="sm">Join</Button>
                                )}
                            </div>
                        </div>
                    );
                }) : <div className="text-center text-muted-foreground">No memberships found</div>}
            </div>
        </main>
    );
}
