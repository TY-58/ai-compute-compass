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
    <div className="glass-card rounded-xl border border-border/50 p-5 card-interactive">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Beneficiary Mapping</h2>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary">Public</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Private</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSubtheme('all')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
              selectedSubtheme === 'all'
                ? 'bg-primary text-primary-foreground glow-subtle'
                : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary hover-lift'
            }`}
          >
            All
          </button>
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
        <div className="ml-auto flex items-center gap-2 text-xs bg-secondary/40 rounded-xl p-1">
          <span className="text-muted-foreground pl-2">Sort:</span>
          <button
            onClick={() => setSortBy('score')}
            className={`px-3 py-1.5 rounded-lg transition-all ${sortBy === 'score' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Score
          </button>
          <button
            onClick={() => setSortBy('delta')}
            className={`px-3 py-1.5 rounded-lg transition-all ${sortBy === 'delta' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            4W Δ
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
        {filteredCompanies.map((company, index) => {
          const primary = getPrimaryExposure(company);
          const subthemeName = SUBTHEMES.find(s => s.id === primary.subthemeId)?.shortName;
          
          return (
            <div 
              key={company.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-all duration-300 animate-slide-up shine"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {/* Status Icon */}
              <div className={`p-2 rounded-xl ${company.isPublic ? 'bg-primary/20 glow-subtle' : 'bg-muted/50'}`}>
                {company.isPublic ? (
                  <Globe className="w-4 h-4 text-primary" />
                ) : (
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {company.name}
                  </span>
                  {company.isPublic && (
                    <span className="font-mono text-xs text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                      {company.ticker}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-border/50">
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
              <div className="text-center min-w-[55px]">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  4W Δ
                </div>
                <div className={`flex items-center justify-center gap-1 font-mono text-sm font-bold ${getDeltaColor(company.delta4Week)}`}>
                  {getDeltaIcon(company.delta4Week)}
                  {company.delta4Week > 0 ? '+' : ''}{Math.round(company.delta4Week)}
                </div>
              </div>

              {/* Pressure Score */}
              <div className="text-right min-w-[55px]">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Score
                </div>
                <div className="font-mono text-xl font-bold text-foreground number-glow">
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
