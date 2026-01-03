import { Link, useLocation } from "wouter";
import { BrainCircuit, History, PlusCircle, Github } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "New Analysis", icon: PlusCircle },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Sidebar / Mobile Header */}
      <aside className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 backdrop-blur-lg flex flex-col relative z-20">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                C.S.A.
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-primary/80 font-mono">
                Engine v1.0
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                  )}
                />
                <span className={cn(isActive && "font-semibold")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="bg-card/40 rounded-lg p-4 border border-white/5">
            <h4 className="text-xs font-mono text-muted-foreground uppercase mb-2">System Status</h4>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-white/80">Stockfish Ready</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        {/* Background Ambient Glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
