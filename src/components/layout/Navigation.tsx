import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, PenSquare, Settings, Sparkles } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container flex items-center h-16 gap-6">
        <div className="flex items-center gap-3 mr-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center glow-primary animate-float">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground tracking-tight">Signal Engine</span>
            <span className="text-[10px] text-muted-foreground font-mono">AI Compute Compass</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            end
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200 hover-lift"
            activeClassName="bg-primary/15 text-primary glow-subtle border border-primary/20"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>

          <NavLink
            to="/workbench"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200 hover-lift"
            activeClassName="bg-primary/15 text-primary glow-subtle border border-primary/20"
          >
            <PenSquare className="w-4 h-4" />
            Workbench
          </NavLink>

          <NavLink
            to="/config"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200 hover-lift"
            activeClassName="bg-primary/15 text-primary glow-subtle border border-primary/20"
          >
            <Settings className="w-4 h-4" />
            Config
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
