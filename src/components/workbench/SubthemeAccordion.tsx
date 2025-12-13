import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SignalInput } from './SignalInput';
import { Subtheme, SIGNALS, SignalType, calculateTotalScoreFromRecords, getPressureLevel } from '@/data/mockData';

interface SignalData {
  score: number;
  rationale: string;
}

interface SubthemeAccordionProps {
  subtheme: Subtheme;
  signals: Record<SignalType, SignalData>;
  previousSignals: Record<SignalType, number | null>;
  onSignalChange: (signalType: SignalType, score: number) => void;
  onRationaleChange: (signalType: SignalType, rationale: string) => void;
  errors: Record<SignalType, string>;
  defaultOpen?: boolean;
}

export function SubthemeAccordion({
  subtheme,
  signals,
  previousSignals,
  onSignalChange,
  onRationaleChange,
  errors,
  defaultOpen = false,
}: SubthemeAccordionProps) {
  const totalScore = useMemo(() => {
    const scores: Record<SignalType, number> = {} as any;
    Object.entries(signals).forEach(([key, val]) => {
      scores[key as SignalType] = val.score;
    });
    return calculateTotalScoreFromRecords(scores);
  }, [signals]);

  const pressureLevel = getPressureLevel(totalScore);

  const getPressureColor = () => {
    switch (pressureLevel) {
      case 'low': return 'text-pressure-low bg-pressure-low/20';
      case 'medium': return 'text-pressure-medium bg-pressure-medium/20';
      case 'high': return 'text-pressure-high bg-pressure-high/20';
      case 'critical': return 'text-pressure-critical bg-pressure-critical/20';
    }
  };

  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? subtheme.id : undefined}>
      <AccordionItem value={subtheme.id} className="border border-border rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/30">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-foreground">
                {subtheme.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-mono font-bold ${getPressureColor()}`}>
                {totalScore}
              </span>
              <span className="text-xs text-muted-foreground uppercase">
                {pressureLevel}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4 pt-2">
            {SIGNALS.map(signal => (
              <SignalInput
                key={signal.id}
                signal={signal}
                value={signals[signal.id]?.score || 0}
                rationale={signals[signal.id]?.rationale || ''}
                previousValue={previousSignals[signal.id]}
                onValueChange={(v) => onSignalChange(signal.id, v)}
                onRationaleChange={(r) => onRationaleChange(signal.id, r)}
                error={errors[signal.id]}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
