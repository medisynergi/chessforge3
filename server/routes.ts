import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { ConsciousnessAnalyzer } from "./lib/analyzer";
import { Chess } from "chess.js";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.games.create.path, async (req, res) => {
    try {
      const { pgn } = api.games.create.input.parse(req.body);
      
      // Basic PGN validation
      const chess = new Chess();
      try {
        chess.loadPgn(pgn);
      } catch (e) {
        return res.status(400).json({ message: "Invalid PGN format" });
      }

      const headers = chess.header();
      const game = await storage.createGame({
        pgn,
        white: headers['White'] || 'Unknown',
        black: headers['Black'] || 'Unknown',
        result: headers['Result'] || '*',
        date: headers['Date'] || new Date().toISOString()
      });

      // Start analysis in background (for now, we'll await it to ensure it works for the MVP, 
      // but ideally this should be a job queue)
      // To prevent timeout, we should probably respond and process in background, 
      // but let's try to do it inline first if it's short, or return pending.
      // Replit might timeout after 30s. Chess analysis is slow.
      // So we MUST return pending and process in background.
      
      (async () => {
        try {
          await storage.updateGameStatus(game.id, "analyzing");
          const analyzer = new ConsciousnessAnalyzer(10); // Lower depth for speed
          const result = await analyzer.analyzeGame(pgn);
          
          await storage.createAnalysis({
            gameId: game.id,
            mLevel: result.mLevel,
            mLevelValue: result.mLevelValue,
            accuracy: result.accuracy,
            avgCpl: result.avgCpl,
            flowIndex: result.flowIndex,
            geometricIntuition: result.geometricIntuition,
            data: result
          });
          
          await storage.updateGameStatus(game.id, "completed");
        } catch (e: any) {
          console.error("Analysis failed:", e);
          await storage.updateGameStatus(game.id, "failed", e.message);
        }
      })();

      res.status(201).json(game);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.games.list.path, async (req, res) => {
    const games = await storage.getGames();
    // For each game, attach analysis summary if exists
    // This is N+1 but acceptable for small scale MVP
    const results = await Promise.all(games.map(async (g) => {
      const analysis = await storage.getAnalysisByGameId(g.id);
      return { ...g, analysis };
    }));
    res.json(results);
  });

  app.get(api.games.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const game = await storage.getGame(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    const analysis = await storage.getAnalysisByGameId(id);
    res.json({ ...game, analysis });
  });

  return httpServer;
}
