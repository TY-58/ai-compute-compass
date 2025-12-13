import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Company, SUBTHEMES, SubthemeId, CompanyExposure } from '@/data/mockData';
import { Save, Trash2, X } from 'lucide-react';

interface ExposureEditorProps {
  company: Company;
  onSave: (id: string, exposures: CompanyExposure[]) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export function ExposureEditor({ company, onSave, onDelete, onCancel }: ExposureEditorProps) {
  const [exposures, setExposures] = useState<Record<SubthemeId, number>>(() => {
    const exp: Record<SubthemeId, number> = {} as any;
    SUBTHEMES.forEach(s => { exp[s.id] = 0; });
    company.exposures.forEach(e => { exp[e.subthemeId] = e.percentage; });
    return exp;
  });

  const totalExposure = Object.values(exposures).reduce((sum, v) => sum + v, 0);
  const isValidExposure = totalExposure <= 100 && totalExposure > 0;

  const handleSave = () => {
    if (!isValidExposure) return;
    
    const newExposures: CompanyExposure[] = Object.entries(exposures)
      .filter(([_, percentage]) => percentage > 0)
      .map(([subthemeId, percentage]) => ({
        subthemeId: subthemeId as SubthemeId,
        percentage,
      }));
    
    onSave(company.id, newExposures);
  };

  return (
    <div className="p-4 bg-card rounded-lg border border-primary/30 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground">{company.name}</h4>
          <span className="font-mono text-xs text-muted-foreground">{company.ticker}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Exposure Weights</span>
          <span className={`text-xs font-mono ${totalExposure > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
            Total: {totalExposure}%
          </span>
        </div>

        <div className="space-y-2">
          {SUBTHEMES.map(subtheme => (
            <div key={subtheme.id} className="flex items-center gap-3">
              <span className="text-sm text-foreground w-32 truncate">{subtheme.shortName}</span>
              <Input
                type="number"
                min={0}
                max={100}
                value={exposures[subtheme.id]}
                onChange={(e) => setExposures(prev => ({
                  ...prev,
                  [subtheme.id]: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                }))}
                className="w-20 text-center font-mono text-sm"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(company.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isValidExposure}
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}
