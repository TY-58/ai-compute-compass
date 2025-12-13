import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, PenSquare, Settings } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container flex items-center h-14 gap-6">
        <div className="flex items-center gap-2 mr-6">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">Δ</span>
          </div>
          <span className="font-semibold text-foreground">Signal Engine</span>
        </div>

        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            activeClassName="bg-secondary text-foreground"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>

          <NavLink
            to="/workbench"
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            activeClassName="bg-secondary text-foreground"
          >
            <PenSquare className="w-4 h-4" />
            Workbench
          </NavLink>

          <NavLink
            to="/config"
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            activeClassName="bg-secondary text-foreground"
          >
            <Settings className="w-4 h-4" />
            Config
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
