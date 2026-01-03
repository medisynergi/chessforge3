import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import { EventEmitter } from "events";

export class StockfishEngine extends EventEmitter {
  private process: ChildProcessWithoutNullStreams | null = null;
  private path: string = "stockfish"; // Assuming it's in PATH
  private depth: number;

  constructor(depth: number = 15) {
    super();
    this.depth = depth;
  }

  start() {
    try {
      this.process = spawn(this.path);
      
      this.process.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (line.trim()) {
            this.emit("line", line.trim());
          }
        }
      });

      this.process.stderr.on("data", (data) => {
        console.error(`Stockfish Error: ${data}`);
      });

      this.sendCommand("uci");
      this.sendCommand("setoption name Threads value 2");
      this.sendCommand("setoption name Hash value 128");
      this.sendCommand("isready");
    } catch (e) {
      console.error("Failed to start stockfish:", e);
      throw e;
    }
  }

  stop() {
    if (this.process) {
      this.sendCommand("quit");
      this.process.kill();
      this.process = null;
    }
  }

  private sendCommand(cmd: string) {
    if (this.process) {
      this.process.stdin.write(cmd + "\n");
    }
  }

  async analyze(fen: string): Promise<{ eval_cp: number; best_move: string | null }> {
    return new Promise((resolve) => {
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${this.depth}`);

      let bestMove: string | null = null;
      let evalCp = 0;

      const lineHandler = (line: string) => {
        if (line.startsWith("bestmove")) {
          const parts = line.split(" ");
          bestMove = parts.length > 1 ? parts[1] : null;
          
          this.off("line", lineHandler);
          resolve({ eval_cp: evalCp, best_move: bestMove });
        } else if (line.includes("score cp")) {
          const match = line.match(/score cp (-?\d+)/);
          if (match) {
            evalCp = parseInt(match[1]);
          }
        } else if (line.includes("score mate")) {
          const match = line.match(/score mate (-?\d+)/);
          if (match) {
            const mate = parseInt(match[1]);
            // Convert mate score to large CP value
            evalCp = (10000 - Math.abs(mate) * 10) * (mate > 0 ? 1 : -1);
          }
        }
      };

      this.on("line", lineHandler);
    });
  }
}
