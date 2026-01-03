import { Chess } from "chess.js";
import { StockfishEngine } from "./stockfish";
import { analysis } from "@shared/schema";

// M-Levels Definition
export const M_LEVELS = [
  { level: 0, name: "Pre-geometric", min: 0, max: 800, threshold: 150 },
  { level: 1, name: "Rule-bound", min: 800, max: 1000, threshold: 100 },
  { level: 2, name: "Pattern-nascent", min: 1000, max: 1200, threshold: 80 },
  { level: 3, name: "Tactical-linear", min: 1200, max: 1400, threshold: 60 },
  { level: 4, name: "Tactical-branching", min: 1400, max: 1600, threshold: 45 },
  { level: 5, name: "Strategic-emergent", min: 1600, max: 1800, threshold: 35 },
  { level: 6, name: "Strategic-integrated", min: 1800, max: 2000, threshold: 25 },
  { level: 7, name: "Positional-intuitive", min: 2000, max: 2200, threshold: 18 },
  { level: 8, name: "Dimensional-fluid", min: 2200, max: 2400, threshold: 12 },
  { level: 9, name: "Geometric-transcendent", min: 2400, max: 2600, threshold: 8 },
  { level: 10, name: "Master-unified", min: 2600, max: 2800, threshold: 0 },
];

function getMLevel(avgCpl: number) {
  for (const m of M_LEVELS) {
    if (avgCpl > m.threshold) return m;
  }
  return M_LEVELS[M_LEVELS.length - 1];
}

export class ConsciousnessAnalyzer {
  private engine: StockfishEngine;

  constructor(depth: number = 15) {
    this.engine = new StockfishEngine(depth);
  }

  async analyzeGame(pgn: string) {
    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
    } catch (e) {
      throw new Error("Invalid PGN");
    }

    this.engine.start();
    const history = chess.history({ verbose: true });
    const analyzedMoves = [];
    
    // Reset board for replay
    const board = new Chess();
    
    let moveNum = 0;

    for (const move of history) {
      const color = move.color; // 'w' or 'b'
      if (color === 'w') moveNum++;

      // Analysis logic matches python script:
      // Analyze position BEFORE the move to see evaluation
      const fenBefore = board.fen();
      const analysisBefore = await this.engine.analyze(fenBefore);
      
      // Make the move
      board.move(move);
      
      // Analyze position AFTER the move (flipped perspective handled by engine value usually, 
      // but python script does specific negation. Stockfish returns score for side to move.
      // So evalBefore (side to move is Player) is Score(Player).
      // evalAfter (side to move is Opponent) is Score(Opponent).
      // So Player's advantage after move is -Score(Opponent).
      
      const fenAfter = board.fen();
      const analysisAfter = await this.engine.analyze(fenAfter);
      
      let evalBefore = analysisBefore.eval_cp;
      let evalAfter = -analysisAfter.eval_cp; // Negate because perspective flipped
      
      // Python script normalization:
      // if color == 'black': eval_before = -eval_before, eval_after = -eval_after
      // BUT Stockfish `score cp` is always relative to side to move.
      // Let's stick to the script logic which seems to try to normalize to White's perspective?
      // Actually, let's look at CPL calculation: max(0, eval_before - eval_after).
      // This implies eval_before and eval_after are both from the perspective of the player who made the move.
      // Since Stockfish gives score for side to move:
      // Before move: Score for Player.
      // After move: Score for Opponent. So -Score(Opponent) is Score for Player.
      // So `eval_before - eval_after` = `Score(Player) - (-Score(Opponent))` -> wait.
      // If I make a good move, my score should stay same. 
      // Example: Mate in 1. Score +1000. 
      // Make move. Opponent is mated. Score -Inf (for opponent). So +Inf for me.
      // CPL = 1000 - Inf < 0. No loss.
      
      // If I blunder. Score +200.
      // Make move. Opponent score +300. My score -300.
      // CPL = 200 - (-300) = 500. Correct.
      
      // So: 
      // evalBefore = analysisBefore.eval_cp
      // evalAfter = -analysisAfter.eval_cp
      // CPL = max(0, evalBefore - evalAfter)
      
      const cpl = Math.max(0, evalBefore - evalAfter);
      
      analyzedMoves.push({
        moveNumber: moveNum,
        color: color === 'w' ? 'white' : 'black',
        san: move.san,
        fen: fenBefore,
        evalBefore,
        evalAfter,
        bestMove: analysisBefore.best_move,
        cpl,
        isBest: analysisBefore.best_move === move.from + move.to || analysisBefore.best_move === move.lan, // lan/uci check
        isBlunder: cpl > 100,
        isMistake: cpl > 50 && cpl <= 100
      });
    }

    this.engine.stop();
    return this.computeMetrics(analyzedMoves);
  }

  private computeMetrics(moves: any[]) {
    const cpls = moves.map(m => m.cpl);
    const sumCpl = cpls.reduce((a, b) => a + b, 0);
    const avgCpl = cpls.length > 0 ? sumCpl / cpls.length : 0;
    
    // Calculate Flow State Index (percentage of moves with CPL < 20 in runs)
    let flowMoves = 0;
    // Python script logic: max run of CPL < 20 / total moves?
    // "runs, cur = [], 0 ... max(runs) / len(cpls)"
    let curRun = 0;
    let maxRun = 0;
    for (const c of cpls) {
      if (c < 20) {
        curRun++;
      } else {
        if (curRun > 0) maxRun = Math.max(maxRun, curRun);
        curRun = 0;
      }
    }
    if (curRun > 0) maxRun = Math.max(maxRun, curRun);
    const flowIndex = cpls.length > 0 ? maxRun / cpls.length : 0;

    // Geometric Intuition: % of best moves
    const bestMoveCount = moves.filter(m => m.isBest).length;
    const geometricIntuition = cpls.length > 0 ? bestMoveCount / cpls.length : 0;

    // Accuracy % (moves with CPL < 10)
    const accuracy = cpls.length > 0 ? (cpls.filter(c => c < 10).length / cpls.length) * 100 : 0;

    // Phases
    const n = moves.length;
    const opEnd = Math.min(15, Math.floor(n / 3));
    const egStart = Math.max(opEnd + 1, n - Math.floor(n / 3));
    
    const phases = {
      opening: this.analyzePhase(moves.slice(0, opEnd)),
      middlegame: this.analyzePhase(moves.slice(opEnd, egStart)),
      endgame: this.analyzePhase(moves.slice(egStart))
    };

    // Collapse Events
    const collapseEvents = [];
    const window = 5;
    if (cpls.length >= window * 2) {
      for (let i = window; i < cpls.length - window; i++) {
        const before = this.mean(cpls.slice(i - window, i));
        const after = this.mean(cpls.slice(i, i + window));
        if (before < 30 && after > before * 2.5 && after > 50) {
          collapseEvents.push({
            moveNumber: moves[i].moveNumber,
            cplBefore: before,
            cplAfter: after,
            severity: after / Math.max(before, 1)
          });
        }
      }
    }

    const mLevel = getMLevel(avgCpl);

    return {
      moves,
      avgCpl,
      accuracy,
      flowIndex,
      geometricIntuition,
      phases,
      collapseEvents,
      mLevel: `M${mLevel.level}-${mLevel.name}`,
      mLevelValue: mLevel.level,
      signature: {
        baseline: mLevel,
        // could add peak/floor logic here if needed
      }
    };
  }

  private analyzePhase(moves: any[]) {
    if (moves.length === 0) return null;
    const cpls = moves.map(m => m.cpl);
    const avgCpl = this.mean(cpls);
    const mLevelObj = getMLevel(avgCpl);
    const accuracy = cpls.length > 0 ? cpls.filter(c => c < 10).length / cpls.length : 0;
    return {
      avgCpl,
      mLevel: `M${mLevelObj.level}-${mLevelObj.name}`,
      accuracy,
      moveCount: moves.length
    };
  }

  private mean(vals: number[]) {
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
}
