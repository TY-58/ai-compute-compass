import { useMemo, useState } from 'react';
import { SUBTHEMES, WeeklySubthemeData, SubthemeId } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, ReferenceLine } from 'recharts';

interface NarrativeChartProps {
  data: WeeklySubthemeData[];
}

export function NarrativeChart({ data }: NarrativeChartProps) {
  const [selectedSubtheme, setSelectedSubtheme] = useState<SubthemeId>('advanced-packaging');

  const chartData = useMemo(() => {
    const weeks = [...new Set(data.map(d => d.week))].sort();
    const latestWeeks = weeks.slice(-8);

    return latestWeeks.map(week => {
      const weekData = data.find(d => d.week === week && d.subthemeId === selectedSubtheme);
      if (!weekData) return null;

      // Calculate fundamental score (without narrative)
      const fundamentalScore = 
        weekData.signals.capexMomentum +
        weekData.signals.constraintTightness +
        weekData.signals.hiringPressure +
        weekData.signals.governmentSupport;

      return {
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fundamentals: fundamentalScore,
        narrative: weekData.signals.narrativeSaturation * 4, // Scale for visibility
        total: weekData.totalScore,
        divergence: fundamentalScore - (weekData.signals.narrativeSaturation * 4),
      };
    }).filter(Boolean);
  }, [data, selectedSubtheme]);

  const selectedThemeName = SUBTHEMES.find(s => s.id === selectedSubtheme)?.name;

  return (
    <div className="glass-card rounded-xl border border-border/50 p-5 card-interactive">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Narrative vs Fundamentals</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Divergence indicates potential hype or underappreciation
          </p>
        </div>
      </div>

      {/* Subtheme Selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {SUBTHEMES.map(subtheme => (
          <button
            key={subtheme.id}
            onClick={() => setSelectedSubtheme(subtheme.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
              selectedSubtheme === subtheme.id
                ? 'bg-primary text-primary-foreground glow-subtle'
                : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary hover-lift'
            }`}
          >
            {subtheme.shortName}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full rounded-lg bg-secondary/20 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 11, fill: 'hsl(215, 20%, 55%)' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(217, 33%, 18%)' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: 'hsl(215, 20%, 55%)' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 25%, 16%)',
                border: '1px solid hsl(220, 20%, 30%)',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 8px 32px hsl(220 25% 5% / 0.5)',
              }}
              labelStyle={{ color: 'hsl(210, 25%, 95%)' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <ReferenceLine y={50} stroke="hsl(220, 20%, 30%)" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="fundamentals"
              name="Fundamentals"
              stroke="hsl(185, 70%, 48%)"
              strokeWidth={3}
              dot={{ r: 5, fill: 'hsl(185, 70%, 48%)', strokeWidth: 2, stroke: 'hsl(220, 25%, 12%)' }}
              activeDot={{ r: 7, stroke: 'hsl(185, 70%, 48%)', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="narrative"
              name="Narrative (scaled)"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 5, fill: 'hsl(0, 84%, 60%)', strokeWidth: 2, stroke: 'hsl(220, 25%, 12%)' }}
              activeDot={{ r: 7, stroke: 'hsl(0, 84%, 60%)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      <div className="mt-5 p-4 rounded-xl bg-secondary/40 border border-border/30">
        <div className="flex items-center gap-3 text-xs">
          <div className="w-3 h-3 rounded-full bg-primary glow-subtle" />
          <span className="text-muted-foreground">
            <span className="text-foreground font-medium">{selectedThemeName}:</span>
            {' '}When narrative (dashed) exceeds fundamentals (solid), hype risk increases.
          </span>
        </div>
      </div>
    </div>
  );
}
