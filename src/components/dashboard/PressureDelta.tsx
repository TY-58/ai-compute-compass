import { useMemo } from 'react';
import { SUBTHEMES, WeeklySubthemeData, SubthemeId, SignalType, SIGNALS, findDriverSignal } from '@/data/mockData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PressureDeltaProps {
  data: WeeklySubthemeData[];
}

interface DeltaData {
  subthemeId: SubthemeId;
  name: string;
  currentScore: number;
  wow: number;
  mom: number;
  driverSignal?: { signal: SignalType; delta: number };
}

export function PressureDelta({ data }: PressureDeltaProps) {
  const deltaData = useMemo(() => {
    const weeks = [...new Set(data.map(d => d.week))].sort();
    const latestWeek = weeks[weeks.length - 1];
    const prevWeek = weeks[weeks.length - 2];
    const fourWeeksAgo = weeks[weeks.length - 5];

    return SUBTHEMES.map(subtheme => {
      const latest = data.find(d => d.week === latestWeek && d.subthemeId === subtheme.id);
      const prev = data.find(d => d.week === prevWeek && d.subthemeId === subtheme.id);
      const old = data.find(d => d.week === fourWeeksAgo && d.subthemeId === subtheme.id);

      const wow = (latest?.totalScore || 0) - (prev?.totalScore || 0);
      const mom = (latest?.totalScore || 0) - (old?.totalScore || 0);

      // Find driver signal if change is significant (±10 or more)
      let driverSignal: { signal: SignalType; delta: number } | undefined;
      if (Math.abs(mom) >= 10 && latest && old) {
        driverSignal = findDriverSignal(latest.signals, old.signals);
      }

      return {
        subthemeId: subtheme.id,
        name: subtheme.shortName,
        currentScore: latest?.totalScore || 0,
        wow,
        mom,
        driverSignal,
      };
    }).sort((a, b) => b.mom - a.mom);
  }, [data]);

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-signal-positive';
    if (delta < 0) return 'text-signal-negative';
    return 'text-muted-foreground';
  };

  const getDeltaBg = (delta: number) => {
    if (delta > 0) return 'bg-signal-positive/10';
    if (delta < 0) return 'bg-signal-negative/10';
    return 'bg-muted/30';
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-3.5 h-3.5" />;
    if (delta < 0) return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const formatDelta = (delta: number) => {
    if (delta > 0) return `+${delta}`;
    return delta.toString();
  };

  const getSignalName = (signalType: SignalType) => {
    return SIGNALS.find(s => s.id === signalType)?.name || signalType;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Pressure Delta</h2>
        <span className="text-xs text-muted-foreground">Sorted by 30-day change</span>
      </div>

      <div className="space-y-3">
        {deltaData.map((item, index) => (
          <div 
            key={item.subthemeId}
            className="p-3 rounded-lg bg-secondary/30 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </span>
                  <span className="font-mono text-lg font-bold text-foreground">
                    {item.currentScore}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* WoW */}
                <div className="text-center min-w-[60px]">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    WoW
                  </div>
                  <div className={`flex items-center justify-center gap-1 font-mono text-sm font-semibold ${getDeltaColor(item.wow)}`}>
                    {getDeltaIcon(item.wow)}
                    {formatDelta(item.wow)}
                  </div>
                </div>

                {/* MoM */}
                <div 
                  className={`text-center min-w-[70px] px-2 py-1 rounded ${getDeltaBg(item.mom)}`}
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    30d
                  </div>
                  <div className={`flex items-center justify-center gap-1 font-mono text-sm font-bold ${getDeltaColor(item.mom)}`}>
                    {getDeltaIcon(item.mom)}
                    {formatDelta(item.mom)}
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Signal Badge */}
            {item.driverSignal && Math.abs(item.mom) >= 10 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <Badge variant="outline" className="text-[10px]">
                  Driven by: {getSignalName(item.driverSignal.signal)} ({item.driverSignal.delta > 0 ? '+' : ''}{item.driverSignal.delta})
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
