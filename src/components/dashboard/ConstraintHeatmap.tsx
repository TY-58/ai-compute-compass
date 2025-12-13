import { useMemo } from 'react';
import { SUBTHEMES, WeeklySubthemeData, getPressureLevel, SubthemeId } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ConstraintHeatmapProps {
  data: WeeklySubthemeData[];
}

export function ConstraintHeatmap({ data }: ConstraintHeatmapProps) {
  const { weeks, heatmapData } = useMemo(() => {
    const uniqueWeeks = [...new Set(data.map(d => d.week))].sort();
    const latestWeeks = uniqueWeeks.slice(-8); // Show last 8 weeks
    
    const heatmap: Record<SubthemeId, Record<string, number>> = {} as any;
    
    SUBTHEMES.forEach(subtheme => {
      heatmap[subtheme.id] = {};
      latestWeeks.forEach(week => {
        const weekData = data.find(d => d.week === week && d.subthemeId === subtheme.id);
        heatmap[subtheme.id][week] = weekData?.totalScore || 0;
      });
    });
    
    return { weeks: latestWeeks, heatmapData: heatmap };
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

  return (
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
                            className={`
                              flex items-center justify-center 
                              h-10 rounded border
                              font-mono text-sm font-semibold
                              transition-all duration-200 hover:scale-105 cursor-default
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
                            <p className="mt-1">Pressure Score: <span className="font-mono font-bold">{score}</span></p>
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
  );
}
