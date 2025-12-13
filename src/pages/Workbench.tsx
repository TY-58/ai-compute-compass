import { useState, useMemo, useCallback } from 'react';
import { startOfWeek } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { WeekSelector } from '@/components/workbench/WeekSelector';
import { SubthemeAccordion } from '@/components/workbench/SubthemeAccordion';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { SUBTHEMES, SIGNALS, SignalType, SubthemeId, WeeklySignalRecord } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Save, RotateCcw } from 'lucide-react';

interface SignalData {
  score: number;
  rationale: string;
}

type FormData = Record<SubthemeId, Record<SignalType, SignalData>>;
type FormErrors = Record<SubthemeId, Record<SignalType, string>>;

function getDefaultFormData(): FormData {
  const data: FormData = {} as any;
  SUBTHEMES.forEach(s => {
    data[s.id] = {} as any;
    SIGNALS.forEach(sig => {
      data[s.id][sig.id] = { score: 0, rationale: '' };
    });
  });
  return data;
}

function getEmptyErrors(): FormErrors {
  const errors: FormErrors = {} as any;
  SUBTHEMES.forEach(s => {
    errors[s.id] = {} as any;
    SIGNALS.forEach(sig => {
      errors[s.id][sig.id] = '';
    });
  });
  return errors;
}

const Workbench = () => {
  const { signalRecords, addSignalRecords, availableWeeks, getPreviousWeekScore } = useData();
  const { toast } = useToast();
  
  // Default to current week's Monday
  const [selectedWeek, setSelectedWeek] = useState<string>(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return monday.toISOString().split('T')[0];
  });

  const [formData, setFormData] = useState<FormData>(() => getDefaultFormData());
  const [errors, setErrors] = useState<FormErrors>(() => getEmptyErrors());
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing data when week changes
  useMemo(() => {
    const existingRecords = signalRecords.filter(r => r.weekId === selectedWeek);
    if (existingRecords.length > 0) {
      const newData = getDefaultFormData();
      existingRecords.forEach(record => {
        if (newData[record.subthemeId] && newData[record.subthemeId][record.signalType]) {
          newData[record.subthemeId][record.signalType] = {
            score: record.scoreValue,
            rationale: record.analystRationale,
          };
        }
      });
      setFormData(newData);
      setHasChanges(false);
    } else {
      setFormData(getDefaultFormData());
      setHasChanges(false);
    }
    setErrors(getEmptyErrors());
  }, [selectedWeek, signalRecords]);

  // Get previous week scores for all signals
  const previousSignals = useMemo(() => {
    const prev: Record<SubthemeId, Record<SignalType, number | null>> = {} as any;
    SUBTHEMES.forEach(s => {
      prev[s.id] = {} as any;
      SIGNALS.forEach(sig => {
        prev[s.id][sig.id] = getPreviousWeekScore(selectedWeek, s.id, sig.id);
      });
    });
    return prev;
  }, [selectedWeek, getPreviousWeekScore]);

  const handleSignalChange = useCallback((subthemeId: SubthemeId, signalType: SignalType, score: number) => {
    setFormData(prev => ({
      ...prev,
      [subthemeId]: {
        ...prev[subthemeId],
        [signalType]: { ...prev[subthemeId][signalType], score },
      },
    }));
    setHasChanges(true);
  }, []);

  const handleRationaleChange = useCallback((subthemeId: SubthemeId, signalType: SignalType, rationale: string) => {
    setFormData(prev => ({
      ...prev,
      [subthemeId]: {
        ...prev[subthemeId],
        [signalType]: { ...prev[subthemeId][signalType], rationale },
      },
    }));
    setErrors(prev => ({
      ...prev,
      [subthemeId]: { ...prev[subthemeId], [signalType]: '' },
    }));
    setHasChanges(true);
  }, []);

  const validateForm = (): boolean => {
    const newErrors = getEmptyErrors();
    let isValid = true;

    SUBTHEMES.forEach(subtheme => {
      SIGNALS.forEach(signal => {
        const data = formData[subtheme.id][signal.id];
        if (data.score > 0 && !data.rationale.trim()) {
          newErrors[subtheme.id][signal.id] = 'Rationale is required when score > 0';
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide rationale for all non-zero scores.',
        variant: 'destructive',
      });
      return;
    }

    const records: WeeklySignalRecord[] = [];
    const now = new Date().toISOString();

    SUBTHEMES.forEach(subtheme => {
      SIGNALS.forEach(signal => {
        const data = formData[subtheme.id][signal.id];
        records.push({
          weekId: selectedWeek,
          subthemeId: subtheme.id,
          signalType: signal.id,
          scoreValue: data.score,
          analystRationale: data.rationale || `Score of ${data.score} recorded.`,
          createdAt: now,
        });
      });
    });

    addSignalRecords(records);
    setHasChanges(false);

    toast({
      title: 'Scores Saved',
      description: `Week of ${selectedWeek} has been saved successfully.`,
    });
  };

  const handleReset = () => {
    const existingRecords = signalRecords.filter(r => r.weekId === selectedWeek);
    if (existingRecords.length > 0) {
      const newData = getDefaultFormData();
      existingRecords.forEach(record => {
        if (newData[record.subthemeId] && newData[record.subthemeId][record.signalType]) {
          newData[record.subthemeId][record.signalType] = {
            score: record.scoreValue,
            rationale: record.analystRationale,
          };
        }
      });
      setFormData(newData);
    } else {
      setFormData(getDefaultFormData());
    }
    setErrors(getEmptyErrors());
    setHasChanges(false);
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Analyst Workbench</h1>
          <p className="text-muted-foreground">
            Enter weekly signal scores with mandatory rationales for auditability.
          </p>
        </div>

        <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg border border-border">
          <WeekSelector
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            availableWeeks={availableWeeks}
          />
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Week
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {SUBTHEMES.map((subtheme, index) => (
            <SubthemeAccordion
              key={subtheme.id}
              subtheme={subtheme}
              signals={formData[subtheme.id]}
              previousSignals={previousSignals[subtheme.id]}
              onSignalChange={(signalType, score) => handleSignalChange(subtheme.id, signalType, score)}
              onRationaleChange={(signalType, rationale) => handleRationaleChange(subtheme.id, signalType, rationale)}
              errors={errors[subtheme.id]}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Workbench;
