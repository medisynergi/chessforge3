import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ChartProps {
  data: any[];
  title: string;
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  delay?: number;
}

export function CplTrendChart({ data, title, delay = 0 }: ChartProps) {
  // Process data to cap CPL for better visualization
  const processedData = data.map((d, i) => ({
    move: i + 1,
    cpl: Math.min(Math.max(d.cpl || 0, -500), 500), // Cap at +/- 500
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card className="bg-card/30 border-white/10 backdrop-blur-sm h-full flex flex-col">
        <CardHeader>
          <CardTitle className="font-display text-sm uppercase tracking-widest text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedData}>
              <defs>
                <linearGradient id="colorCpl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="move"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                tickLine={false}
                axisLine={false}
                domain={[-500, 500]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontFamily: "var(--font-mono)",
                }}
                itemStyle={{ color: "#06b6d4" }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Area
                type="monotone"
                dataKey="cpl"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCpl)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface PhaseProps {
  phase: string;
  data: {
    mLevel: string;
    avgCpl: number;
    accuracy: number;
  };
  color: string;
  delay?: number;
}

export function PhaseCard({ phase, data, color, delay = 0 }: PhaseProps) {
  if (!data) return null;
  
  // Handle both string and object formats for mLevel
  const mLevelDisplay = typeof data.mLevel === 'string' 
    ? data.mLevel 
    : (data.mLevel && typeof data.mLevel === 'object' && 'level' in data.mLevel && 'name' in data.mLevel)
      ? `M${(data.mLevel as any).level}-${(data.mLevel as any).name}`
      : 'N/A';
  
  const accuracy = data.accuracy ?? 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-card/40 p-5 backdrop-blur-md"
    >
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
      <h4 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        {phase}
      </h4>
      <div className="space-y-4">
        <div>
          <span className="text-xs text-muted-foreground block mb-1">Consciousness</span>
          <div className="font-display font-bold text-lg text-white">{mLevelDisplay}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Avg CPL</span>
            <div className="font-mono text-sm text-white">{data.avgCpl?.toFixed(1)}</div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Accuracy</span>
            <div className="font-mono text-sm text-white">{(accuracy * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
