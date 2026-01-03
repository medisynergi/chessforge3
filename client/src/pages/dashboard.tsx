import { useParams } from "wouter";
import { useGame } from "@/hooks/use-games";
import { Layout } from "@/components/layout";
import { MetricCard } from "@/components/ui/metric-card";
import { CplTrendChart, PhaseCard } from "@/components/ui/analysis-charts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Activity, Target, Zap, TrendingDown, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { id } = useParams();
  const { data: game, isLoading, error } = useGame(Number(id));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-secondary animate-spin reverse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-8 h-8 text-muted-foreground animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-display font-bold">Analyzing Consciousness Signature...</h2>
            <p className="text-muted-foreground animate-pulse">Running depth analysis on Stockfish 16 engine</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !game) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Analysis Failed</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't process this game. Please try again with a valid PGN.
          </p>
          <a href="/" className="text-primary hover:underline">Return Home</a>
        </div>
      </Layout>
    );
  }

  // Handle pending/analyzing state manually if socket updates aren't instant
  if (game.status !== "completed") {
     return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
           <div className="text-center space-y-2">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-mono mb-4 animate-pulse">
               <Clock className="w-4 h-4" />
               <span>Processing Move Queue...</span>
             </div>
             <h1 className="text-3xl md:text-4xl font-display font-bold">Processing Game #{game.id}</h1>
             <p className="text-muted-foreground">Calculating M-Levels and Flow States. This may take a minute.</p>
           </div>
        </div>
      </Layout>
     );
  }

  const analysis = game.analysis!;
  const phases = analysis.data.phases;

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-mono">
                {game.date}
              </Badge>
              <Badge variant="outline" className="border-white/10 text-muted-foreground font-mono">
                {game.result}
              </Badge>
            </div>
            <h1 className="text-3xl font-display font-bold flex flex-col md:flex-row md:items-center gap-2">
              <span className="text-white">{game.white}</span>
              <span className="text-muted-foreground text-xl">vs</span>
              <span className="text-white">{game.black}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-right">
             <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
               <CheckCircle className="w-4 h-4 text-green-500" />
               <span className="text-sm font-medium text-green-500">Analysis Complete</span>
             </div>
          </div>
        </div>

        {/* Primary Consciousness Meter */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-gradient-to-br from-primary/20 via-background to-secondary/10 border border-primary/20 p-8 md:p-12 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-lg font-mono text-primary uppercase tracking-widest">Consciousness Signature</h2>
              <div className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 neon-text">
                {analysis.mLevel || "M0"}
              </div>
              <p className="text-xl text-muted-foreground max-w-xl">
                {analysis.mLevelValue && analysis.mLevelValue >= 8 ? "Divine-Transcendental play with minimal error." :
                 analysis.mLevelValue && analysis.mLevelValue >= 5 ? "Strategic-Emergent calculation detected." :
                 "Reactive-Materialistic pattern recognized."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:gap-8 w-full md:w-auto">
               <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/5 text-center">
                 <div className="text-2xl font-bold font-mono text-white">{(analysis.accuracy! * 100).toFixed(1)}%</div>
                 <div className="text-xs text-muted-foreground uppercase tracking-wider">Accuracy</div>
               </div>
               <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/5 text-center">
                 <div className="text-2xl font-bold font-mono text-white">{analysis.avgCpl?.toFixed(0)}</div>
                 <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg CPL</div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Flow Index"
            value={analysis.flowIndex?.toFixed(1) || "0.0"}
            icon={Zap}
            color="secondary"
            delay={0.1}
          />
          <MetricCard
            title="Geometric Intuition"
            value={analysis.geometricIntuition?.toFixed(1) || "0.0"}
            icon={Target}
            color="accent"
            delay={0.2}
          />
          <MetricCard
            title="Collapse Events"
            value={analysis.data.collapseEvents?.length || 0}
            icon={TrendingDown}
            color="destructive"
            delay={0.3}
          />
          <MetricCard
            title="Moves Analyzed"
            value={analysis.data.moves.length}
            icon={Activity}
            color="default"
            delay={0.4}
          />
        </div>

        {/* Charts & Phase Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
          <div className="lg:col-span-2 h-full">
            <CplTrendChart 
              title="Centipawn Loss Trend (Cognitive Stability)" 
              data={analysis.data.moves} 
              dataKey="cpl" 
              delay={0.5} 
            />
          </div>
          <div className="h-full flex flex-col gap-4">
            <PhaseCard 
              phase="Opening" 
              data={phases.opening} 
              color="#06b6d4" 
              delay={0.6} 
            />
            <PhaseCard 
              phase="Middlegame" 
              data={phases.middlegame} 
              color="#8b5cf6" 
              delay={0.7} 
            />
            <PhaseCard 
              phase="Endgame" 
              data={phases.endgame} 
              color="#f43f5e" 
              delay={0.8} 
            />
          </div>
        </div>

        {/* Collapse Events */}
        {analysis.data.collapseEvents && analysis.data.collapseEvents.length > 0 && (
          <div className="space-y-4">
             <h3 className="font-display font-bold text-lg">Collapse Events (Mental Gaps)</h3>
             <div className="grid gap-3">
               {analysis.data.collapseEvents.map((event: any, i: number) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.9 + (i * 0.1) }}
                   className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-xl"
                 >
                   <div className="flex items-center gap-4">
                     <span className="font-mono text-destructive font-bold text-lg">Move {event.move}</span>
                     <div>
                       <div className="text-sm font-medium text-white">{event.description || "Significant accuracy drop detected"}</div>
                       <div className="text-xs text-muted-foreground">Pre-move eval: {event.preEval}, Post-move: {event.postEval}</div>
                     </div>
                   </div>
                   <Badge variant="destructive">Loss: {Math.abs(event.cpLoss)}</Badge>
                 </motion.div>
               ))}
             </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
