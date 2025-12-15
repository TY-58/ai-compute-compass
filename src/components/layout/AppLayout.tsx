import { ReactNode } from 'react';
import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <Navigation />
      
      <main className="flex-1 relative z-10">
        {children}
      </main>
      
      <footer className="border-t border-border/50 py-5 bg-card/50 backdrop-blur-sm relative z-10">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div className="space-y-1">
            <p className="font-medium text-foreground/80">AI Compute & Power Constraint Signal Dashboard</p>
            <p>Investment research tool • GDPR compliant • Public data only</p>
          </div>
          <div className="text-right space-y-1">
            <p>Weekly update cadence</p>
            <p className="font-mono text-primary/80">v2.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
