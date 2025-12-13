import { ReactNode } from 'react';
import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-4">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div>
            <p>AI Compute & Power Constraint Signal Dashboard</p>
            <p className="mt-1">Investment research tool • GDPR compliant • Public data only</p>
          </div>
          <div className="text-right">
            <p>Weekly update cadence</p>
            <p className="mt-1 font-mono">v2.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
