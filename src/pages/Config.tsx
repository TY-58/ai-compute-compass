import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CompanyForm } from '@/components/config/CompanyForm';
import { ExposureEditor } from '@/components/config/ExposureEditor';
import { useData } from '@/context/DataContext';
import { Company, SUBTHEMES, CompanyExposure } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Globe, Building2, Edit2 } from 'lucide-react';

const Config = () => {
  const { companies, addCompany, updateCompany, deleteCompany } = useData();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddCompany = (company: Company) => {
    if (companies.some(c => c.id === company.id || c.ticker === company.ticker)) {
      toast({
        title: 'Duplicate Company',
        description: 'A company with this ticker already exists.',
        variant: 'destructive',
      });
      return;
    }
    addCompany(company);
    toast({
      title: 'Company Added',
      description: `${company.name} has been added successfully.`,
    });
  };

  const handleSaveExposures = (id: string, exposures: CompanyExposure[]) => {
    updateCompany(id, { exposures });
    setEditingId(null);
    toast({
      title: 'Exposures Updated',
      description: 'Company exposure weights have been saved.',
    });
  };

  const handleDeleteCompany = (id: string) => {
    const company = companies.find(c => c.id === id);
    deleteCompany(id);
    setEditingId(null);
    toast({
      title: 'Company Deleted',
      description: `${company?.name} has been removed.`,
    });
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Configuration</h1>
          <p className="text-muted-foreground">
            Manage companies and their subtheme exposure weightings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Company Form */}
          <div className="lg:col-span-1">
            <CompanyForm onSubmit={handleAddCompany} />
          </div>

          {/* Company List */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Companies ({companies.length})
              </h3>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {companies.map(company => (
                  editingId === company.id ? (
                    <ExposureEditor
                      key={company.id}
                      company={company}
                      onSave={handleSaveExposures}
                      onDelete={handleDeleteCompany}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div
                      key={company.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer"
                      onClick={() => setEditingId(company.id)}
                    >
                      <div className={`p-1.5 rounded ${company.isPublic ? 'bg-primary/20' : 'bg-muted'}`}>
                        {company.isPublic ? (
                          <Globe className="w-4 h-4 text-primary" />
                        ) : (
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {company.name}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {company.ticker}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {company.exposures.slice(0, 3).map(exp => {
                            const subtheme = SUBTHEMES.find(s => s.id === exp.subthemeId);
                            return (
                              <Badge key={exp.subthemeId} variant="outline" className="text-[10px] px-1.5 py-0">
                                {subtheme?.shortName} {exp.percentage}%
                              </Badge>
                            );
                          })}
                          {company.exposures.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{company.exposures.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Config;
