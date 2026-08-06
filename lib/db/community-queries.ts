import { and, count, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";

/** Count members for each community id. */
export async function getMemberCountsByCommunityIds(
  communityIds: string[],
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (communityIds.length === 0) return result;

  const rows = await db
    .select({
      communityId: members.communityId,
      total: count(),
    })
    .from(members)
    .where(inArray(members.communityId, communityIds))
    .groupBy(members.communityId);

  for (const row of rows) {
    result.set(String(row.communityId), Number(row.total));
  }

  return result;
}

/** Community ids where `userAddress` is a member (among the given ids). */
export async function getUserMembershipIds(
  communityIds: string[],
  userAddress: string,
): Promise<Set<string>> {
  const result = new Set<string>();
  if (!userAddress || communityIds.length === 0) return result;

  const rows = await db
    .select({ communityId: members.communityId })
    .from(members)
    .where(
      and(
        eq(members.userAddress, userAddress),
        inArray(members.communityId, communityIds),
      ),
    );

  for (const row of rows) {
    result.add(String(row.communityId));
  }

  return result;
}
