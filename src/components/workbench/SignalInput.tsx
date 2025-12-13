import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Signal, SignalType } from '@/data/mockData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SignalInputProps {
  signal: Signal;
  value: number;
  rationale: string;
  previousValue: number | null;
  onValueChange: (value: number) => void;
  onRationaleChange: (rationale: string) => void;
  error?: string;
}

export function SignalInput({
  signal,
  value,
  rationale,
  previousValue,
  onValueChange,
  onRationaleChange,
  error,
}: SignalInputProps) {
  const delta = previousValue !== null ? value - previousValue : null;
  const isNegativeSignal = signal.id === 'narrative';

  const getDeltaColor = () => {
    if (delta === null || delta === 0) return 'text-muted-foreground';
    if (isNegativeSignal) {
      return delta > 0 ? 'text-signal-negative' : 'text-signal-positive';
    }
    return delta > 0 ? 'text-signal-positive' : 'text-signal-negative';
  };

  const getDeltaIcon = () => {
    if (delta === null || delta === 0) return <Minus className="w-3 h-3" />;
    return delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-3 p-4 rounded-lg bg-secondary/20 border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium text-foreground">
            {signal.name}
          </Label>
          <span className="text-xs text-muted-foreground">
            Weight: {signal.weight > 0 ? '+' : ''}{(signal.weight * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-4">
          {previousValue !== null && (
            <div className="text-xs text-muted-foreground">
              Prev: <span className="font-mono">{previousValue}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-foreground w-8 text-center">
              {value}
            </span>
            {delta !== null && (
              <div className={`flex items-center gap-1 text-xs font-mono ${getDeltaColor()}`}>
                {getDeltaIcon()}
                {delta > 0 ? '+' : ''}{delta}
              </div>
            )}
          </div>
        </div>
      </div>

      <Slider
        value={[value]}
        onValueChange={(v) => onValueChange(v[0])}
        max={signal.maxScore}
        min={0}
        step={1}
        className="w-full"
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span className="font-mono">Max: {signal.maxScore}</span>
      </div>

      <div className="pt-2">
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Analyst Rationale <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={rationale}
          onChange={(e) => onRationaleChange(e.target.value)}
          placeholder={`Explain why you scored ${signal.name} at ${value}...`}
          className={`min-h-[80px] text-sm ${error ? 'border-destructive' : ''}`}
        />
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
