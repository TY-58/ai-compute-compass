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
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Narrative vs Fundamentals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Divergence indicates potential hype or underappreciation
          </p>
        </div>
      </div>

      {/* Subtheme Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Chart */}
      <div className="h-[280px] w-full">
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
                backgroundColor: 'hsl(222, 44%, 10%)',
                border: '1px solid hsl(217, 33%, 18%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(210, 20%, 92%)' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <ReferenceLine y={50} stroke="hsl(217, 33%, 25%)" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="fundamentals"
              name="Fundamentals"
              stroke="hsl(173, 58%, 39%)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'hsl(173, 58%, 39%)' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="narrative"
              name="Narrative (scaled)"
              stroke="hsl(0, 72%, 51%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: 'hsl(0, 72%, 51%)' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      <div className="mt-4 p-3 rounded-lg bg-secondary/30">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">
            <span className="text-foreground font-medium">{selectedThemeName}:</span>
            {' '}When narrative (dashed) exceeds fundamentals (solid), hype risk increases.
          </span>
        </div>
      </div>
    </div>
  );
}
