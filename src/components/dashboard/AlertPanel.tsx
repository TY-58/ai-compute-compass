import { Alert as AlertData, SUBTHEMES } from '@/data/mockData';
import { AlertTriangle, TrendingUp, Zap, X } from 'lucide-react';
import { useState } from 'react';

interface AlertPanelProps {
  alerts: AlertData[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

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

  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]));
  };

  if (visibleAlerts.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Alerts</h2>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-sm">No active alerts</p>
          <p className="text-xs mt-1">Signals are within normal ranges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Active Alerts</h2>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-destructive/20 text-destructive">
          {visibleAlerts.length} active
        </span>
      </div>

      <div className="space-y-3">
        {visibleAlerts.map((alert, index) => {
          const config = getAlertConfig(alert.type);
          const Icon = config.icon;
          const subtheme = SUBTHEMES.find(s => s.id === alert.subthemeId);

          return (
            <div
              key={alert.id}
              className={`
                relative p-3 rounded-lg border
                ${config.bgColor} ${config.borderColor}
                animate-fade-in
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.labelBg}`}>
                      {config.label}
                    </span>
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
