import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  white: text("white"),
  black: text("black"),
  result: text("result"),
  date: text("date"),
  pgn: text("pgn").notNull(),
  status: text("status").default("pending"), // pending, analyzing, completed, failed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysis = pgTable("analysis", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  mLevel: text("m_level"),
  mLevelValue: integer("m_level_value"), // 0-10
  accuracy: real("accuracy"),
  avgCpl: real("avg_cpl"),
  flowIndex: real("flow_index"),
  geometricIntuition: real("geometric_intuition"),
  data: jsonb("data").$type<{
    moves: any[];
    phases: { opening: any; middlegame: any; endgame: any };
    collapseEvents: any[];
    signature: any;
  }>(),
});

export const gamesRelations = relations(games, ({ one }) => ({
  analysis: one(analysis, {
    fields: [games.id],
    references: [analysis.gameId],
  }),
}));

export const analysisRelations = relations(analysis, ({ one }) => ({
  game: one(games, {
    fields: [analysis.gameId],
    references: [games.id],
  }),
}));

export const insertGameSchema = createInsertSchema(games).pick({
  pgn: true,
  white: true,
  black: true,
  result: true,
  date: true,
});

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Analysis = typeof analysis.$inferSelect;
