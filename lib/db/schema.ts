import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Community listing + gated metadata (index, not chain authority). */
export const communities = pgTable("communities", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  guidelines: text("guidelines").array().notNull().default([]),
  mintPrice: numeric("mint_price", { precision: 20, scale: 8 }).notNull().default("0"),
  hiddenLink: text("hidden_link"),
  creatorAddress: text("creator_address").notNull(),
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Wallet membership rows keyed by community + address. */
export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    communityId: uuid("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    userAddress: text("user_address").notNull(),
    txHash: text("tx_hash"),
  },
  (table) => [
    uniqueIndex("members_community_user_uidx").on(table.communityId, table.userAddress),
    index("members_user_address_idx").on(table.userAddress),
  ],
);

export type Community = typeof communities.$inferSelect;
export type NewCommunity = typeof communities.$inferInsert;
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
