import { useGames } from "@/hooks/use-games";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, Zap, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function History() {
  const { data: games, isLoading } = useGames();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 pt-10">
          <h1 className="text-3xl font-display font-bold">Analysis History</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl bg-card/50" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pt-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold">Analysis History</h1>
          <p className="text-muted-foreground mt-2">
            Archive of previously analyzed games and their consciousness signatures.
          </p>
        </motion.div>

        {!games || games.length === 0 ? (
          <div className="text-center py-20 bg-card/20 rounded-2xl border border-white/5 border-dashed">
            <p className="text-muted-foreground mb-4">No games analyzed yet.</p>
            <Link href="/" className="text-primary hover:underline font-medium">
              Start your first analysis
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {games.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/analysis/${game.id}`}>
                  <Card className="group relative overflow-hidden bg-card/30 hover:bg-card/50 border-white/10 hover:border-primary/30 transition-all duration-300">
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {game.date || "Unknown Date"}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className={game.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}>
                             {game.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="font-display font-bold text-lg md:text-xl text-white">
                            {game.white} <span className="text-muted-foreground font-sans font-normal text-base mx-1">vs</span> {game.black}
                          </div>
                        </div>

                        {game.analysis ? (
                           <div className="flex gap-2">
                             <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                               {game.analysis.mLevel || "N/A"}
                             </Badge>
                             <Badge variant="outline" className="border-white/10 text-muted-foreground">
                               Acc: {(game.analysis.accuracy! * 100).toFixed(0)}%
                             </Badge>
                           </div>
                        ) : (
                           <Badge variant="outline" className="border-yellow-500/20 text-yellow-500 bg-yellow-500/5">
                             Processing...
                           </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-6">
                         {game.analysis && (
                            <div className="hidden md:flex flex-col items-end gap-1">
                               <div className="text-xs text-muted-foreground uppercase tracking-widest">Flow Index</div>
                               <div className="flex items-center gap-1 font-mono text-secondary font-bold text-xl">
                                  <Zap className="w-4 h-4" />
                                  {game.analysis.flowIndex?.toFixed(1)}
                               </div>
                            </div>
                         )}
                         <div className="p-2 rounded-full bg-white/5 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <ArrowRight className="w-5 h-5" />
                         </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
