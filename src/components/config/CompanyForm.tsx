import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Company, SUBTHEMES, SubthemeId } from '@/data/mockData';
import { Plus } from 'lucide-react';

interface CompanyFormProps {
  onSubmit: (company: Company) => void;
}

export function CompanyForm({ onSubmit }: CompanyFormProps) {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [exposures, setExposures] = useState<Record<SubthemeId, number>>(() => {
    const exp: Record<SubthemeId, number> = {} as any;
    SUBTHEMES.forEach(s => { exp[s.id] = 0; });
    return exp;
  });

  const totalExposure = Object.values(exposures).reduce((sum, v) => sum + v, 0);
  const isValidExposure = totalExposure <= 100 && totalExposure > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !ticker.trim() || !isValidExposure) return;

    const company: Company = {
      id: ticker.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: name.trim(),
      ticker: ticker.trim().toUpperCase(),
      description: description.trim(),
      isPublic,
      exposures: Object.entries(exposures)
        .filter(([_, percentage]) => percentage > 0)
        .map(([subthemeId, percentage]) => ({
          subthemeId: subthemeId as SubthemeId,
          percentage,
        })),
    };

    onSubmit(company);

    // Reset form
    setName('');
    setTicker('');
    setDescription('');
    setIsPublic(true);
    SUBTHEMES.forEach(s => { exposures[s.id] = 0; });
    setExposures({ ...exposures });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-secondary/20 rounded-lg border border-border">
      <h3 className="text-sm font-semibold text-foreground">Add New Company</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-xs">Company Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="NVIDIA Corporation"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="ticker" className="text-xs">Ticker</Label>
          <Input
            id="ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="NVDA"
            className="mt-1 font-mono"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-xs">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief company description..."
          className="mt-1 min-h-[60px]"
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <Label htmlFor="isPublic" className="text-sm">
          Publicly traded
        </Label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Subtheme Exposure (%)</Label>
          <span className={`text-xs font-mono ${totalExposure > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
            Total: {totalExposure}%
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {SUBTHEMES.map(subtheme => (
            <div key={subtheme.id} className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={exposures[subtheme.id]}
                onChange={(e) => setExposures(prev => ({
                  ...prev,
                  [subtheme.id]: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                }))}
                className="w-16 text-center font-mono text-sm"
              />
              <span className="text-xs text-muted-foreground">{subtheme.shortName}</span>
            </div>
          ))}
        </div>
        
        {totalExposure > 100 && (
          <p className="text-xs text-destructive">Total exposure cannot exceed 100%</p>
        )}
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={!name.trim() || !ticker.trim() || !isValidExposure}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Company
      </Button>
    </form>
  );
}
