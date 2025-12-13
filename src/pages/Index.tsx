import { useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ConstraintHeatmap } from '@/components/dashboard/ConstraintHeatmap';
import { PressureDelta } from '@/components/dashboard/PressureDelta';
import { BeneficiaryMapping } from '@/components/dashboard/BeneficiaryMapping';
import { NarrativeChart } from '@/components/dashboard/NarrativeChart';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { SignalBreakdown } from '@/components/dashboard/SignalBreakdown';
import { WEEKLY_DATA, generateAlerts } from '@/data/mockData';

const Index = () => {
  const alerts = useMemo(() => generateAlerts(WEEKLY_DATA), []);
  const lastUpdated = useMemo(() => {
    const weeks = [...new Set(WEEKLY_DATA.map(d => d.week))].sort();
    return weeks[weeks.length - 1];
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader lastUpdated={lastUpdated} />

      <main className="container py-6">
        {/* Alerts - Top priority visibility */}
        {alerts.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <AlertPanel alerts={alerts} />
          </div>
        )}

        {/* Primary View: Constraint Heatmap */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <ConstraintHeatmap data={WEEKLY_DATA} />
        </div>

        {/* Secondary Views Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <PressureDelta data={WEEKLY_DATA} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
            <SignalBreakdown data={WEEKLY_DATA} />
          </div>
        </div>

        {/* Analysis Views Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <NarrativeChart data={WEEKLY_DATA} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
            <BeneficiaryMapping data={WEEKLY_DATA} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>
              <p>AI Compute & Power Constraint Signal Dashboard</p>
              <p className="mt-1">Investment research tool • GDPR compliant • Public data only</p>
            </div>
            <div className="text-right">
              <p>Weekly update cadence</p>
              <p className="mt-1 font-mono">v1.0.0</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
