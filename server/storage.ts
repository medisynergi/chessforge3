import { db } from "./db";
import { games, analysis, type InsertGame, type Game, type Analysis } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  getGames(): Promise<Game[]>;
  updateGameStatus(id: number, status: string, error?: string): Promise<Game>;
  createAnalysis(data: any): Promise<Analysis>; // data should match schema structure but omitting id
  getAnalysisByGameId(gameId: number): Promise<Analysis | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async getGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(desc(games.createdAt));
  }

  async updateGameStatus(id: number, status: string, error?: string): Promise<Game> {
    const [game] = await db
      .update(games)
      .set({ status, errorMessage: error })
      .where(eq(games.id, id))
      .returning();
    return game;
  }

  async createAnalysis(data: any): Promise<Analysis> {
    const [result] = await db.insert(analysis).values(data).returning();
    return result;
  }

  async getAnalysisByGameId(gameId: number): Promise<Analysis | undefined> {
    const [result] = await db.select().from(analysis).where(eq(analysis.gameId, gameId));
    return result;
  }
}

export const storage = new DatabaseStorage();
