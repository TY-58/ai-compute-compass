// Subtheme definitions
export type SubthemeId = 
  | 'lithography-fabs'
  | 'advanced-packaging'
  | 'power-generation'
  | 'cooling-thermal'
  | 'interconnects-networking';

export interface Subtheme {
  id: SubthemeId;
  name: string;
  shortName: string;
}

export const SUBTHEMES: Subtheme[] = [
  { id: 'lithography-fabs', name: 'Lithography & Fabs', shortName: 'Litho/Fabs' },
  { id: 'advanced-packaging', name: 'Advanced Packaging', shortName: 'Packaging' },
  { id: 'power-generation', name: 'Power Generation & Grid', shortName: 'Power' },
  { id: 'cooling-thermal', name: 'Cooling & Thermal', shortName: 'Cooling' },
  { id: 'interconnects-networking', name: 'Interconnects & Networking', shortName: 'Interconnects' },
];

// Signal definitions with weights
export interface Signal {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
}

export const SIGNALS: Signal[] = [
  { id: 'capex-momentum', name: 'CapEx Momentum', weight: 0.30, maxScore: 30 },
  { id: 'constraint-tightness', name: 'Constraint Tightness', weight: 0.25, maxScore: 25 },
  { id: 'hiring-pressure', name: 'Hiring Pressure', weight: 0.15, maxScore: 15 },
  { id: 'government-support', name: 'Government Support', weight: 0.15, maxScore: 15 },
  { id: 'narrative-saturation', name: 'Narrative Saturation', weight: -0.15, maxScore: 15 },
];

// Weekly data structure
export interface WeeklySignalData {
  capexMomentum: number;
  constraintTightness: number;
  hiringPressure: number;
  governmentSupport: number;
  narrativeSaturation: number;
}

export interface WeeklySubthemeData {
  week: string;
  subthemeId: SubthemeId;
  signals: WeeklySignalData;
  totalScore: number;
}

// Company exposure
export interface CompanyExposure {
  subthemeId: SubthemeId;
  percentage: number;
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  isPublic: boolean;
  exposures: CompanyExposure[];
}

// Alert types
export type AlertType = 'breakout' | 'acceleration' | 'hype';

export interface Alert {
  id: string;
  type: AlertType;
  subthemeId: SubthemeId;
  message: string;
  timestamp: string;
  score?: number;
  delta?: number;
}

// Calculate total score from signals
export function calculateTotalScore(signals: WeeklySignalData): number {
  return Math.max(0, Math.min(100,
    signals.capexMomentum +
    signals.constraintTightness +
    signals.hiringPressure +
    signals.governmentSupport -
    signals.narrativeSaturation
  ));
}

// Generate weeks for the past N weeks
function generateWeeks(count: number): string[] {
  const weeks: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    weeks.push(date.toISOString().split('T')[0]);
  }
  return weeks;
}

// Mock weekly data - 12 weeks of historical data
const WEEKS = generateWeeks(12);

export const WEEKLY_DATA: WeeklySubthemeData[] = [
  // Lithography & Fabs - High pressure, showing constraint tightening
  ...WEEKS.map((week, i) => ({
    week,
    subthemeId: 'lithography-fabs' as SubthemeId,
    signals: {
      capexMomentum: 20 + Math.floor(i * 0.8) + (i > 8 ? 5 : 0),
      constraintTightness: 18 + Math.floor(i * 0.5),
      hiringPressure: 10 + (i > 6 ? 3 : 0),
      governmentSupport: 12 + (i > 4 ? 3 : 0),
      narrativeSaturation: 5 + Math.floor(i * 0.3),
    },
    get totalScore() { return calculateTotalScore(this.signals); }
  })),
  
  // Advanced Packaging - Strong growth, NVIDIA-driven
  ...WEEKS.map((week, i) => ({
    week,
    subthemeId: 'advanced-packaging' as SubthemeId,
    signals: {
      capexMomentum: 22 + Math.floor(i * 0.9),
      constraintTightness: 20 + Math.floor(i * 0.6),
      hiringPressure: 12 + (i > 5 ? 3 : 0),
      governmentSupport: 10 + Math.floor(i * 0.2),
      narrativeSaturation: 8 + Math.floor(i * 0.5),
    },
    get totalScore() { return calculateTotalScore(this.signals); }
  })),
  
  // Power Generation - Emerging theme, accelerating
  ...WEEKS.map((week, i) => ({
    week,
    subthemeId: 'power-generation' as SubthemeId,
    signals: {
      capexMomentum: 15 + Math.floor(i * 1.2),
      constraintTightness: 12 + Math.floor(i * 0.8),
      hiringPressure: 8 + Math.floor(i * 0.5),
      governmentSupport: 8 + Math.floor(i * 0.4),
      narrativeSaturation: 3 + Math.floor(i * 0.2),
    },
    get totalScore() { return calculateTotalScore(this.signals); }
  })),
  
  // Cooling & Thermal - Niche but growing
  ...WEEKS.map((week, i) => ({
    week,
    subthemeId: 'cooling-thermal' as SubthemeId,
    signals: {
      capexMomentum: 12 + Math.floor(i * 0.7),
      constraintTightness: 10 + Math.floor(i * 0.4),
      hiringPressure: 6 + (i > 7 ? 4 : 0),
      governmentSupport: 5 + Math.floor(i * 0.1),
      narrativeSaturation: 2 + Math.floor(i * 0.1),
    },
    get totalScore() { return calculateTotalScore(this.signals); }
  })),
  
  // Interconnects & Networking - Steady, infrastructure backbone
  ...WEEKS.map((week, i) => ({
    week,
    subthemeId: 'interconnects-networking' as SubthemeId,
    signals: {
      capexMomentum: 18 + Math.floor(i * 0.5),
      constraintTightness: 15 + Math.floor(i * 0.3),
      hiringPressure: 9 + Math.floor(i * 0.2),
      governmentSupport: 7 + Math.floor(i * 0.2),
      narrativeSaturation: 4 + Math.floor(i * 0.3),
    },
    get totalScore() { return calculateTotalScore(this.signals); }
  })),
];

// Company data with exposures
export const COMPANIES: Company[] = [
  {
    id: 'asml',
    name: 'ASML Holding',
    ticker: 'ASML',
    isPublic: true,
    exposures: [
      { subthemeId: 'lithography-fabs', percentage: 80 },
      { subthemeId: 'advanced-packaging', percentage: 15 },
      { subthemeId: 'interconnects-networking', percentage: 5 },
    ],
  },
  {
    id: 'nvidia',
    name: 'NVIDIA Corporation',
    ticker: 'NVDA',
    isPublic: true,
    exposures: [
      { subthemeId: 'advanced-packaging', percentage: 45 },
      { subthemeId: 'interconnects-networking', percentage: 35 },
      { subthemeId: 'cooling-thermal', percentage: 10 },
      { subthemeId: 'power-generation', percentage: 10 },
    ],
  },
  {
    id: 'tsmc',
    name: 'Taiwan Semiconductor',
    ticker: 'TSM',
    isPublic: true,
    exposures: [
      { subthemeId: 'lithography-fabs', percentage: 60 },
      { subthemeId: 'advanced-packaging', percentage: 35 },
      { subthemeId: 'interconnects-networking', percentage: 5 },
    ],
  },
  {
    id: 'bloom-energy',
    name: 'Bloom Energy',
    ticker: 'BE',
    isPublic: true,
    exposures: [
      { subthemeId: 'power-generation', percentage: 85 },
      { subthemeId: 'cooling-thermal', percentage: 15 },
    ],
  },
  {
    id: 'vertiv',
    name: 'Vertiv Holdings',
    ticker: 'VRT',
    isPublic: true,
    exposures: [
      { subthemeId: 'cooling-thermal', percentage: 60 },
      { subthemeId: 'power-generation', percentage: 40 },
    ],
  },
  {
    id: 'broadcom',
    name: 'Broadcom Inc',
    ticker: 'AVGO',
    isPublic: true,
    exposures: [
      { subthemeId: 'interconnects-networking', percentage: 55 },
      { subthemeId: 'advanced-packaging', percentage: 30 },
      { subthemeId: 'lithography-fabs', percentage: 15 },
    ],
  },
  {
    id: 'applied-materials',
    name: 'Applied Materials',
    ticker: 'AMAT',
    isPublic: true,
    exposures: [
      { subthemeId: 'lithography-fabs', percentage: 70 },
      { subthemeId: 'advanced-packaging', percentage: 25 },
      { subthemeId: 'interconnects-networking', percentage: 5 },
    ],
  },
  {
    id: 'lam-research',
    name: 'Lam Research',
    ticker: 'LRCX',
    isPublic: true,
    exposures: [
      { subthemeId: 'lithography-fabs', percentage: 75 },
      { subthemeId: 'advanced-packaging', percentage: 20 },
      { subthemeId: 'interconnects-networking', percentage: 5 },
    ],
  },
  {
    id: 'constellation-energy',
    name: 'Constellation Energy',
    ticker: 'CEG',
    isPublic: true,
    exposures: [
      { subthemeId: 'power-generation', percentage: 95 },
      { subthemeId: 'cooling-thermal', percentage: 5 },
    ],
  },
  {
    id: 'nkt-photonics',
    name: 'NKT Photonics',
    ticker: 'NKT',
    isPublic: false,
    exposures: [
      { subthemeId: 'interconnects-networking', percentage: 70 },
      { subthemeId: 'lithography-fabs', percentage: 30 },
    ],
  },
];

// Generate alerts based on data
export function generateAlerts(data: WeeklySubthemeData[]): Alert[] {
  const alerts: Alert[] = [];
  const latestWeek = WEEKS[WEEKS.length - 1];
  const previousWeek = WEEKS[WEEKS.length - 2];
  const fourWeeksAgo = WEEKS[WEEKS.length - 5];

  SUBTHEMES.forEach(subtheme => {
    const latestData = data.find(d => d.week === latestWeek && d.subthemeId === subtheme.id);
    const prevData = data.find(d => d.week === previousWeek && d.subthemeId === subtheme.id);
    const oldData = data.find(d => d.week === fourWeeksAgo && d.subthemeId === subtheme.id);

    if (!latestData || !prevData) return;

    // Breakout Alert: Score > 65 for 2 consecutive weeks
    if (latestData.totalScore > 65 && prevData.totalScore > 65) {
      alerts.push({
        id: `breakout-${subtheme.id}`,
        type: 'breakout',
        subthemeId: subtheme.id,
        message: `${subtheme.name} showing sustained pressure above 65`,
        timestamp: latestWeek,
        score: latestData.totalScore,
      });
    }

    // Acceleration Alert: +15 increase within 30 days
    if (oldData && latestData.totalScore - oldData.totalScore >= 15) {
      alerts.push({
        id: `acceleration-${subtheme.id}`,
        type: 'acceleration',
        subthemeId: subtheme.id,
        message: `${subtheme.name} accelerating rapidly (+${latestData.totalScore - oldData.totalScore} in 4 weeks)`,
        timestamp: latestWeek,
        delta: latestData.totalScore - oldData.totalScore,
      });
    }

    // Hype Warning: Narrative rising faster than fundamentals
    const narrativeChange = latestData.signals.narrativeSaturation - (prevData?.signals.narrativeSaturation || 0);
    const fundamentalChange = (
      (latestData.signals.capexMomentum - (prevData?.signals.capexMomentum || 0)) +
      (latestData.signals.constraintTightness - (prevData?.signals.constraintTightness || 0))
    ) / 2;

    if (narrativeChange > fundamentalChange + 2 && latestData.signals.narrativeSaturation > 8) {
      alerts.push({
        id: `hype-${subtheme.id}`,
        type: 'hype',
        subthemeId: subtheme.id,
        message: `${subtheme.name}: Narrative outpacing fundamentals`,
        timestamp: latestWeek,
      });
    }
  });

  return alerts;
}

// Helper to get pressure level
export function getPressureLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 35) return 'low';
  if (score < 55) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

// Calculate company pressure score
export function calculateCompanyPressureScore(
  company: Company,
  latestSubthemeScores: Record<SubthemeId, number>
): number {
  return company.exposures.reduce((total, exposure) => {
    const subthemeScore = latestSubthemeScores[exposure.subthemeId] || 0;
    return total + (subthemeScore * exposure.percentage / 100);
  }, 0);
}
