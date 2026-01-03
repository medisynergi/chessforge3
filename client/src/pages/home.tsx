import { useState } from "react";
import { useCreateGame } from "@/hooks/use-games";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Cpu, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [pgn, setPgn] = useState("");
  const createGame = useCreateGame();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pgn.trim()) return;
    createGame.mutate(pgn);
  };

  const handleSamplePgn = () => {
    setPgn(`[Event "F/S Return Match"]
[Site "Belgrade, Serbia JUG"]
[Date "1992.11.04"]
[Round "29"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[Result "1/2-1/2"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3
O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15.
Nb1 h6 16. Bh4 c5 17. dxe5 Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21.
Nc4 Nxc4 22. Bxc4 Nb6 23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7
27. Qe3 Qg5 28. Qxg5 hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33.
f3 Bc8 34. Kf2 Bf5 35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5
40. Rd6 Kc5 41. Ra6 Nf2 42. g4 Bd3 43. Re6 1/2-1/2`);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-4">
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Chess Consciousness Analysis</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 pb-2">
            Decode the Mind <br /> Behind the Moves
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your PGN to analyze consciousness signatures, flow states, and geometric intuition levels using our advanced Stockfish-driven engine.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 my-12">
          {[
            {
              icon: Brain,
              title: "M-Level Analysis",
              desc: "Determine the consciousness tier (M0-M10) of your gameplay strategy."
            },
            {
              icon: Cpu,
              title: "Flow Metrics",
              desc: "Measure cognitive flow state stability and depth during critical phases."
            },
            {
              icon: Sparkles,
              title: "Intuition Score",
              desc: "Quantify geometric intuition and pattern recognition capabilities."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
              className="p-6 rounded-2xl bg-card/30 border border-white/5 hover:bg-card/50 transition-colors backdrop-blur-sm"
            >
              <feature.icon className="w-8 h-8 text-primary mb-4 opacity-80" />
              <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="glass-panel border-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <CardHeader>
              <CardTitle className="font-display">Start Analysis</CardTitle>
              <CardDescription>Paste a raw PGN string below to begin processing.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder="[Event 'World Championship']..."
                    className="min-h-[200px] font-mono text-sm bg-black/40 border-white/10 focus:border-primary/50 focus:ring-primary/20 resize-none p-4 leading-relaxed"
                    value={pgn}
                    onChange={(e) => setPgn(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleSamplePgn}
                    className="absolute top-3 right-3 text-xs text-primary hover:text-primary/80 hover:underline bg-black/60 px-2 py-1 rounded"
                  >
                    Load Sample
                  </button>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={createGame.isPending || !pgn.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300"
                  >
                    {createGame.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Initializing Engine...
                      </>
                    ) : (
                      <>
                        Analyze Signature <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
