import { AppLayout } from '@/components/layout/AppLayout';
import { ConstraintHeatmap } from '@/components/dashboard/ConstraintHeatmap';
import { PressureDelta } from '@/components/dashboard/PressureDelta';
import { BeneficiaryMapping } from '@/components/dashboard/BeneficiaryMapping';
import { NarrativeChart } from '@/components/dashboard/NarrativeChart';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { SignalBreakdown } from '@/components/dashboard/SignalBreakdown';
import { useData } from '@/context/DataContext';
import { Activity, TrendingUp } from 'lucide-react';

const Index = () => {
  const { weeklyData, alerts, companies, latestWeek } = useData();

  return (
    <AppLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              AI Compute & Power Constraints
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Last updated: <span className="font-mono text-foreground/80">{latestWeek}</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span>
              <span className="font-mono text-primary">{companies.length}</span> companies tracked
            </span>
          </div>
        </div>

        {/* Alerts - Top priority visibility */}
        {alerts.length > 0 && (
          <div className="mb-8 animate-slide-up">
            <AlertPanel alerts={alerts} />
          </div>
        )}

        {/* Primary View: Constraint Heatmap */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <ConstraintHeatmap data={weeklyData} />
        </div>

        {/* Secondary Views Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <PressureDelta data={weeklyData} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
            <SignalBreakdown data={weeklyData} />
          </div>
        </div>

        {/* Analysis Views Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <NarrativeChart data={weeklyData} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
            <BeneficiaryMapping data={weeklyData} companies={companies} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
