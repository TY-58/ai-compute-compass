import { useMemo, useState } from 'react';
import { SUBTHEMES, Company, SubthemeId, WeeklySubthemeData, calculateCompanyPressureScore, calculateCompany4WeekDelta } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BeneficiaryMappingProps {
  data: WeeklySubthemeData[];
  companies: Company[];
}

export function BeneficiaryMapping({ data, companies }: BeneficiaryMappingProps) {
  const [selectedSubtheme, setSelectedSubtheme] = useState<SubthemeId | 'all'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'delta'>('score');

  const { latestScores, companiesWithScores } = useMemo(() => {
    const weeks = [...new Set(data.map(d => d.week))].sort();
    const latestWeek = weeks[weeks.length - 1];
    
    const scores: Record<SubthemeId, number> = {} as any;
    SUBTHEMES.forEach(subtheme => {
      const weekData = data.find(d => d.week === latestWeek && d.subthemeId === subtheme.id);
      scores[subtheme.id] = weekData?.totalScore || 0;
    });

    const withScores = companies.map(company => ({
      ...company,
      pressureScore: calculateCompanyPressureScore(company, scores),
      delta4Week: calculateCompany4WeekDelta(company, data),
    }));

    return { latestScores: scores, companiesWithScores: withScores };
  }, [data, companies]);

  const filteredCompanies = useMemo(() => {
    let filtered = selectedSubtheme === 'all' 
      ? companiesWithScores 
      : companiesWithScores.filter(c => c.exposures.some(e => e.subthemeId === selectedSubtheme));
    
    return filtered.sort((a, b) => 
      sortBy === 'score' 
        ? b.pressureScore - a.pressureScore 
        : b.delta4Week - a.delta4Week
    );
  }, [companiesWithScores, selectedSubtheme, sortBy]);

  const getPrimaryExposure = (company: Company) => {
    const sorted = [...company.exposures].sort((a, b) => b.percentage - a.percentage);
    return sorted[0];
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-signal-positive';
    if (delta < 0) return 'text-signal-negative';
    return 'text-muted-foreground';
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 2) return <TrendingUp className="w-3 h-3" />;
    if (delta < -2) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Beneficiary Mapping</h2>
        <div className="flex items-center gap-2 text-xs">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Public</span>
          <Building2 className="w-3.5 h-3.5 text-muted-foreground ml-2" />
          <span className="text-muted-foreground">Private</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedSubtheme('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedSubtheme === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All
          </button>
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
        <div className="ml-auto flex items-center gap-1 text-xs">
          <span className="text-muted-foreground">Sort:</span>
          <button
            onClick={() => setSortBy('score')}
            className={`px-2 py-1 rounded ${sortBy === 'score' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Score
          </button>
          <button
            onClick={() => setSortBy('delta')}
            className={`px-2 py-1 rounded ${sortBy === 'delta' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            4W Δ
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {filteredCompanies.map((company, index) => {
          const primary = getPrimaryExposure(company);
          const subthemeName = SUBTHEMES.find(s => s.id === primary.subthemeId)?.shortName;
          
          return (
            <div 
              key={company.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Status Icon */}
              <div className={`p-1.5 rounded ${company.isPublic ? 'bg-primary/20' : 'bg-muted'}`}>
                {company.isPublic ? (
                  <Globe className="w-4 h-4 text-primary" />
                ) : (
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {company.name}
                  </span>
                  {company.isPublic && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {company.ticker}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {subthemeName} {primary.percentage}%
                  </Badge>
                  {company.exposures.length > 1 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{company.exposures.length - 1} more
                    </span>
                  )}
                </div>
              </div>

              {/* 4-Week Delta */}
              <div className="text-center min-w-[50px]">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  4W Δ
                </div>
                <div className={`flex items-center justify-center gap-0.5 font-mono text-sm font-semibold ${getDeltaColor(company.delta4Week)}`}>
                  {getDeltaIcon(company.delta4Week)}
                  {company.delta4Week > 0 ? '+' : ''}{Math.round(company.delta4Week)}
                </div>
              </div>

              {/* Pressure Score */}
              <div className="text-right min-w-[50px]">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Score
                </div>
                <div className="font-mono text-lg font-bold text-foreground">
                  {Math.round(company.pressureScore)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
