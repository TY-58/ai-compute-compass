import { useMemo, useState } from 'react';
import { SUBTHEMES, SIGNALS, WeeklySubthemeData, SubthemeId } from '@/data/mockData';
import { Progress } from '@/components/ui/progress';

interface SignalBreakdownProps {
  data: WeeklySubthemeData[];
}

export function SignalBreakdown({ data }: SignalBreakdownProps) {
  const [selectedSubtheme, setSelectedSubtheme] = useState<SubthemeId>('lithography-fabs');

  const breakdown = useMemo(() => {
    const weeks = [...new Set(data.map(d => d.week))].sort();
    const latestWeek = weeks[weeks.length - 1];
    const weekData = data.find(d => d.week === latestWeek && d.subthemeId === selectedSubtheme);

    if (!weekData) return null;

    return {
      capexMomentum: { value: weekData.signals.capexMomentum, max: 30 },
      constraintTightness: { value: weekData.signals.constraintTightness, max: 25 },
      hiringPressure: { value: weekData.signals.hiringPressure, max: 15 },
      governmentSupport: { value: weekData.signals.governmentSupport, max: 15 },
      narrativeSaturation: { value: weekData.signals.narrativeSaturation, max: 15 },
      total: weekData.totalScore,
    };
  }, [data, selectedSubtheme]);

  const getSignalColor = (signalId: string) => {
    if (signalId === 'narrative-saturation') return 'bg-destructive';
    return 'bg-primary';
  };

  const signalDisplayData = [
    { id: 'capex-momentum', name: 'CapEx Momentum', weight: '+30%', ...breakdown?.capexMomentum },
    { id: 'constraint-tightness', name: 'Constraint Tightness', weight: '+25%', ...breakdown?.constraintTightness },
    { id: 'hiring-pressure', name: 'Hiring Pressure', weight: '+15%', ...breakdown?.hiringPressure },
    { id: 'government-support', name: 'Government Support', weight: '+15%', ...breakdown?.governmentSupport },
    { id: 'narrative-saturation', name: 'Narrative Saturation', weight: '−15%', ...breakdown?.narrativeSaturation },
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Signal Breakdown</h2>
        {breakdown && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total Score
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">
              {breakdown.total}
            </div>
          </div>
        )}
      </div>

      {/* Subtheme Selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {SUBTHEMES.map(subtheme => (
          <button
            key={subtheme.id}
            onClick={() => setSelectedSubtheme(subtheme.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedSubtheme === subtheme.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {subtheme.shortName}
          </button>
        ))}
      </div>

      {/* Signal Bars */}
      <div className="space-y-4">
        {signalDisplayData.map((signal, index) => (
          <div 
            key={signal.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{signal.name}</span>
                <span className={`text-xs font-mono ${signal.id === 'narrative-saturation' ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {signal.weight}
                </span>
              </div>
              <span className="font-mono text-sm font-semibold text-foreground">
                {signal.value}/{signal.max}
              </span>
            </div>
            <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${getSignalColor(signal.id)}`}
                style={{ width: `${(signal.value! / signal.max!) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Scoring Rules Reference */}
      <div className="mt-6 pt-4 border-t border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Scoring Rules
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="text-muted-foreground">CapEx:</span>
            <span className="text-foreground ml-1">+10 single, +20 multi, +30 weak macro</span>
          </div>
          <div>
            <span className="text-muted-foreground">Constraint:</span>
            <span className="text-foreground ml-1">+10 mild, +20 sustained, +25 structural</span>
          </div>
          <div>
            <span className="text-muted-foreground">Hiring:</span>
            <span className="text-foreground ml-1">+5 net, +10 specialized, +15 sustained</span>
          </div>
          <div>
            <span className="text-muted-foreground">Govt:</span>
            <span className="text-foreground ml-1">+5 policy, +10 funding, +15 multi-year</span>
          </div>
        </div>
      </div>
    </div>
  );
}
