import { Activity, RefreshCw, Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  lastUpdated: string;
}

export function DashboardHeader({ lastUpdated }: DashboardHeaderProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 glow-primary">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                AI Compute Signal Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Infrastructure constraint analysis for thematic investing
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {formatDate(lastUpdated)}</span>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Subtheme Quick Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">5</span> Subthemes tracked
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">10</span> Companies mapped
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">12</span> Weeks historical
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="w-2 h-2 rounded-full bg-signal-positive animate-pulse" />
            <span className="text-xs text-signal-positive font-medium">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
