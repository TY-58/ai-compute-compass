import { AppLayout } from '@/components/layout/AppLayout';
import { ConstraintHeatmap } from '@/components/dashboard/ConstraintHeatmap';
import { PressureDelta } from '@/components/dashboard/PressureDelta';
import { BeneficiaryMapping } from '@/components/dashboard/BeneficiaryMapping';
import { NarrativeChart } from '@/components/dashboard/NarrativeChart';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { SignalBreakdown } from '@/components/dashboard/SignalBreakdown';
import { useData } from '@/context/DataContext';

const Index = () => {
  const { weeklyData, alerts, companies, latestWeek } = useData();

  return (
    <AppLayout>
      <div className="container py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            AI Compute & Power Constraints
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {latestWeek} • {companies.length} companies tracked
          </p>
        </div>

        {/* Alerts - Top priority visibility */}
        {alerts.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <AlertPanel alerts={alerts} />
          </div>
        )}

        {/* Primary View: Constraint Heatmap */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <ConstraintHeatmap data={weeklyData} />
        </div>

        {/* Secondary Views Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
