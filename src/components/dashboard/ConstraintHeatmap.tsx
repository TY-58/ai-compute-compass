import { useMemo, useState } from 'react';
import { SUBTHEMES, WeeklySubthemeData, getPressureLevel, SubthemeId, SIGNALS, SignalType } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ConstraintHeatmapProps {
  data: WeeklySubthemeData[];
}

interface CellDetail {
  subtheme: string;
  week: string;
  score: number;
  signals: WeeklySubthemeData['signals'];
  rationales?: Record<SignalType, string>;
}

export function ConstraintHeatmap({ data }: ConstraintHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<CellDetail | null>(null);

  const { weeks, heatmapData, detailData } = useMemo(() => {
    const uniqueWeeks = [...new Set(data.map(d => d.week))].sort();
    const latestWeeks = uniqueWeeks.slice(-8);
    
    const heatmap: Record<SubthemeId, Record<string, number>> = {} as any;
    const details: Record<string, WeeklySubthemeData> = {};
    
    SUBTHEMES.forEach(subtheme => {
      heatmap[subtheme.id] = {};
      latestWeeks.forEach(week => {
        const weekData = data.find(d => d.week === week && d.subthemeId === subtheme.id);
        heatmap[subtheme.id][week] = weekData?.totalScore || 0;
        if (weekData) {
          details[`${subtheme.id}-${week}`] = weekData;
        }
      });
    });
    
    return { weeks: latestWeeks, heatmapData: heatmap, detailData: details };
  }, [data]);

  const formatWeek = (week: string) => {
    const date = new Date(week);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPressureColor = (score: number) => {
    const level = getPressureLevel(score);
    switch (level) {
      case 'low': return 'bg-pressure-low/30 text-pressure-low';
      case 'medium': return 'bg-pressure-medium/30 text-pressure-medium';
      case 'high': return 'bg-pressure-high/30 text-pressure-high';
      case 'critical': return 'bg-pressure-critical/30 text-pressure-critical';
    }
  };

  const getPressureBorder = (score: number) => {
    const level = getPressureLevel(score);
    switch (level) {
      case 'low': return 'border-pressure-low/50';
      case 'medium': return 'border-pressure-medium/50';
      case 'high': return 'border-pressure-high/50';
      case 'critical': return 'border-pressure-critical/50';
    }
  };

  const handleCellClick = (subtheme: typeof SUBTHEMES[0], week: string) => {
    const weekData = detailData[`${subtheme.id}-${week}`];
    if (weekData) {
      setSelectedCell({
        subtheme: subtheme.name,
        week,
        score: weekData.totalScore,
        signals: weekData.signals,
        rationales: weekData.signalRationales,
      });
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Constraint Pressure Heatmap</h2>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-pressure-low/50" />
              <span className="text-muted-foreground">&lt;35</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-pressure-medium/50" />
              <span className="text-muted-foreground">35-54</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-pressure-high/50" />
              <span className="text-muted-foreground">55-74</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-pressure-critical/50" />
              <span className="text-muted-foreground">≥75</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4 min-w-[140px]">
                  Subtheme
                </th>
                {weeks.map(week => (
                  <th key={week} className="text-center text-xs text-muted-foreground font-medium pb-3 px-1 min-w-[60px]">
                    {formatWeek(week)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUBTHEMES.map(subtheme => (
                <tr key={subtheme.id}>
                  <td className="py-2 pr-4">
                    <span className="text-sm font-medium text-foreground">{subtheme.shortName}</span>
                  </td>
                  {weeks.map(week => {
                    const score = heatmapData[subtheme.id][week];
                    return (
                      <td key={week} className="p-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              onClick={() => handleCellClick(subtheme, week)}
                              className={`
                                flex items-center justify-center 
                                h-10 rounded border
                                font-mono text-sm font-semibold
                                transition-all duration-200 hover:scale-105 cursor-pointer
                                ${getPressureColor(score)} ${getPressureBorder(score)}
                              `}
                            >
                              {score}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-popover border-border">
                            <div className="text-xs">
                              <p className="font-semibold">{subtheme.name}</p>
                              <p className="text-muted-foreground">{formatWeek(week)}</p>
                              <p className="mt-1">Click to view rationales</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCell?.subtheme} — Week of {selectedCell && formatWeek(selectedCell.week)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCell && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Total Score:</span>
                <span className={`font-mono text-2xl font-bold ${getPressureColor(selectedCell.score).split(' ')[1]}`}>
                  {selectedCell.score}
                </span>
              </div>

              <div className="space-y-3">
                {SIGNALS.map(signal => {
                  const signalKey = signal.id;
                  const signalMap: Record<SignalType, keyof typeof selectedCell.signals> = {
                    capex: 'capexMomentum',
                    constraint: 'constraintTightness',
                    hiring: 'hiringPressure',
                    government: 'governmentSupport',
                    narrative: 'narrativeSaturation',
                  };
                  const value = selectedCell.signals[signalMap[signalKey]];
                  const rationale = selectedCell.rationales?.[signalKey];

                  return (
                    <div key={signal.id} className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{signal.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-bold text-foreground">{value}</span>
                          <span className="text-xs text-muted-foreground">/ {signal.maxScore}</span>
                        </div>
                      </div>
                      {rationale && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {rationale}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
