import { Alert as AlertData, SUBTHEMES, SIGNALS, SignalType } from '@/data/mockData';
import { AlertTriangle, TrendingUp, Zap, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AlertPanelProps {
  alerts: AlertData[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.has(a.id));

  const getAlertConfig = (type: AlertData['type']) => {
    switch (type) {
      case 'breakout':
        return {
          icon: TrendingUp,
          bgColor: 'bg-alert-breakout/10',
          borderColor: 'border-alert-breakout/30',
          iconColor: 'text-alert-breakout',
          label: 'BREAKOUT',
          labelBg: 'bg-alert-breakout/20 text-alert-breakout',
        };
      case 'acceleration':
        return {
          icon: Zap,
          bgColor: 'bg-alert-acceleration/10',
          borderColor: 'border-alert-acceleration/30',
          iconColor: 'text-alert-acceleration',
          label: 'ACCELERATION',
          labelBg: 'bg-alert-acceleration/20 text-alert-acceleration',
        };
      case 'hype':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-alert-hype/10',
          borderColor: 'border-alert-hype/30',
          iconColor: 'text-alert-hype',
          label: 'HYPE WARNING',
          labelBg: 'bg-alert-hype/20 text-alert-hype',
        };
    }
  };

  const getSignalName = (signalType?: SignalType) => {
    if (!signalType) return '';
    return SIGNALS.find(s => s.id === signalType)?.name || signalType;
  };

  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]));
  };

  const toggleExpanded = (id: string) => {
    setExpandedAlerts(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (visibleAlerts.length === 0) {
    return (
      <div className="glass-card rounded-xl border border-border/50 p-5">
        <h2 className="text-lg font-semibold text-foreground tracking-tight mb-4">Active Alerts</h2>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mb-3 animate-float">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium">No active alerts</p>
          <p className="text-xs mt-1">Signals are within normal ranges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Active Alerts</h2>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-destructive/20 text-destructive badge-pulse">
          {visibleAlerts.length} active
        </span>
      </div>

      <div className="space-y-3">
        {visibleAlerts.map((alert, index) => {
          const config = getAlertConfig(alert.type);
          const Icon = config.icon;
          const subtheme = SUBTHEMES.find(s => s.id === alert.subthemeId);
          const isExpanded = expandedAlerts.has(alert.id);
          const hasRationale = !!alert.triggeringRationale;

          return (
            <Collapsible
              key={alert.id}
              open={isExpanded}
              onOpenChange={() => hasRationale && toggleExpanded(alert.id)}
            >
              <div
                className={`
                  relative p-4 rounded-xl border
                  ${config.bgColor} ${config.borderColor}
                  animate-slide-up hover-lift
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-secondary/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                <div className="flex items-start gap-3 pr-6">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.labelBg}`}>
                        {config.label}
                      </span>
                      {alert.driverSignal && (
                        <Badge variant="outline" className="text-[10px]">
                          Driver: {getSignalName(alert.driverSignal)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{subtheme?.name}</span>
                      {alert.score && (
                        <span className="font-mono">Score: {alert.score}</span>
                      )}
                      {alert.delta && (
                        <span className="font-mono text-signal-positive">+{alert.delta}</span>
                      )}
                    </div>

                    {hasRationale && (
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isExpanded ? 'Hide rationale' : 'View rationale'}
                        </button>
                      </CollapsibleTrigger>
                    )}
                  </div>
                </div>

                <CollapsibleContent>
                  {alert.triggeringRationale && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">Analyst Note: </span>
                        {alert.triggeringRationale}
                      </p>
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
