// Subtheme definitions
export type SubthemeId = 
  | 'lithography-fabs'
  | 'advanced-packaging'
  | 'power-generation'
  | 'cooling-thermal'
  | 'interconnects-networking';

export type SignalType = 'capex' | 'constraint' | 'hiring' | 'government' | 'narrative';

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
  id: SignalType;
  name: string;
  weight: number;
  maxScore: number;
}

export const SIGNALS: Signal[] = [
  { id: 'capex', name: 'CapEx Momentum', weight: 0.30, maxScore: 30 },
  { id: 'constraint', name: 'Constraint Tightness', weight: 0.25, maxScore: 25 },
  { id: 'hiring', name: 'Hiring Pressure', weight: 0.15, maxScore: 15 },
  { id: 'government', name: 'Government Support', weight: 0.15, maxScore: 15 },
  { id: 'narrative', name: 'Narrative Saturation', weight: -0.15, maxScore: 15 },
];

// Time-series signal record (the core auditable unit)
export interface WeeklySignalRecord {
  weekId: string;
  subthemeId: SubthemeId;
  signalType: SignalType;
  scoreValue: number;
  analystRationale: string;
  createdAt: string;
}

// Computed subtheme score (derived from signal records)
export interface ComputedSubthemeScore {
  weekId: string;
  subthemeId: SubthemeId;
  signals: Record<SignalType, { score: number; rationale: string }>;
  totalScore: number;
}

// Legacy weekly data interface for backward compatibility
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
  signalRationales?: Record<SignalType, string>;
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
  description: string;
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
  triggeringRationale?: string;
  driverSignal?: SignalType;
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

// Calculate total score from signal records
export function calculateTotalScoreFromRecords(signals: Record<SignalType, number>): number {
  return Math.max(0, Math.min(100,
    (signals.capex || 0) +
    (signals.constraint || 0) +
    (signals.hiring || 0) +
    (signals.government || 0) -
    (signals.narrative || 0)
  ));
}

// Convert signal records to WeeklySubthemeData
export function convertRecordsToWeeklyData(records: WeeklySignalRecord[]): WeeklySubthemeData[] {
  const grouped: Record<string, WeeklySignalRecord[]> = {};
  
  records.forEach(record => {
    const key = `${record.weekId}-${record.subthemeId}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(record);
  });

  return Object.entries(grouped).map(([key, recs]) => {
    const [weekId, ...subthemeParts] = key.split('-');
    const subthemeId = subthemeParts.join('-') as SubthemeId;
    
    const signalMap: Record<SignalType, { score: number; rationale: string }> = {} as any;
    recs.forEach(rec => {
      signalMap[rec.signalType] = { score: rec.scoreValue, rationale: rec.analystRationale };
    });

    const signals: WeeklySignalData = {
      capexMomentum: signalMap.capex?.score || 0,
      constraintTightness: signalMap.constraint?.score || 0,
      hiringPressure: signalMap.hiring?.score || 0,
      governmentSupport: signalMap.government?.score || 0,
      narrativeSaturation: signalMap.narrative?.score || 0,
    };

    const signalRationales: Record<SignalType, string> = {
      capex: signalMap.capex?.rationale || '',
      constraint: signalMap.constraint?.rationale || '',
      hiring: signalMap.hiring?.rationale || '',
      government: signalMap.government?.rationale || '',
      narrative: signalMap.narrative?.rationale || '',
    };

    return {
      week: recs[0].weekId,
      subthemeId: recs[0].subthemeId,
      signals,
      totalScore: calculateTotalScore(signals),
      signalRationales,
    };
  });
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

// Mock rationales for different scenarios
const MOCK_RATIONALES: Record<SignalType, Record<SubthemeId, string[]>> = {
  capex: {
    'lithography-fabs': [
      'ASML announced €2B expansion in Netherlands facility. Multiple fab projects in parallel.',
      'Intel expanding Ohio fab faster than expected. Industry capex commitments remain elevated.',
      'TSMC Arizona phase 2 accelerating. Samsung also increasing Korean capacity.',
      'Multiple fab expansions despite weak macro. Strong conviction in AI compute demand.',
    ],
    'advanced-packaging': [
      'CoWoS capacity expansion across Taiwan. TSMC 2x capacity increase announced.',
      'New packaging facility in Japan receiving equipment. Intel advancing Foveros.',
      'NVIDIA suppliers investing heavily in advanced packaging lines.',
      'Multiple companies racing to secure advanced packaging capacity.',
    ],
    'power-generation': [
      'Data center power agreements accelerating. Nuclear restarts being discussed.',
      'Hyperscalers signing long-term PPAs at unprecedented rates.',
      'Grid infrastructure investments increasing across key markets.',
      'New power generation facilities announced near major data center hubs.',
    ],
    'cooling-thermal': [
      'Liquid cooling adoption accelerating. New facility investments announced.',
      'Immersion cooling pilots expanding to production scale.',
      'Thermal management becoming board-level priority at hyperscalers.',
      'Vertiv and Schneider increasing cooling capacity investments.',
    ],
    'interconnects-networking': [
      'High-bandwidth interconnect investments continuing. Optical expansion in progress.',
      'Networking equipment orders remain strong. New fab for networking chips.',
      'AI cluster interconnect spending remains elevated.',
      'Multiple companies expanding high-speed networking capacity.',
    ],
  },
  constraint: {
    'lithography-fabs': [
      'EUV tool lead times extended to 24+ months. Supply chain stretched.',
      'Skilled workforce shortage impacting ramp timelines.',
      'Equipment installation delays across multiple facilities.',
      'Structural constraint acknowledged by ASML CEO in earnings call.',
    ],
    'advanced-packaging': [
      'CoWoS capacity fully booked through 2025. Customers competing for slots.',
      'Advanced packaging yield issues causing delivery delays.',
      'Substrate shortages constraining packaging capacity utilization.',
      'Multiple reports of packaging being the primary bottleneck for AI chips.',
    ],
    'power-generation': [
      'Grid connection delays extending project timelines by 18+ months.',
      'Power availability becoming gating factor for data center site selection.',
      'Regulatory approvals for new power projects taking longer than expected.',
      'Transformer lead times now 36+ months. Critical bottleneck identified.',
    ],
    'cooling-thermal': [
      'Cooling equipment lead times extending. Demand outpacing supply.',
      'Specialized cooling solutions for high-density racks in short supply.',
      'CDU manufacturers at capacity. New orders facing delays.',
      'Thermal management emerging as unexpected bottleneck for AI deployments.',
    ],
    'interconnects-networking': [
      'High-speed optical components facing supply constraints.',
      'Networking chip lead times extended. Capacity additions underway.',
      'Coherent optics supply chain stretched thin.',
      'InfiniBand and custom fabric solutions facing allocation.',
    ],
  },
  hiring: {
    'lithography-fabs': [
      'ASML hiring 5,000 engineers globally. Competition for talent intense.',
      'Fab technician recruitment at record levels.',
      'Universities expanding semiconductor programs but graduates years away.',
      'Sustained multi-quarter hiring across all major equipment vendors.',
    ],
    'advanced-packaging': [
      'Packaging engineers in high demand. Salaries up 25% YoY.',
      'New roles for advanced packaging R&D appearing across industry.',
      'TSMC and Intel both expanding packaging engineering teams significantly.',
      'Specialized hiring for CoWoS and Foveros technologies accelerating.',
    ],
    'power-generation': [
      'Electrical engineers for data center power in short supply.',
      'Grid infrastructure companies competing for same talent pool.',
      'Net hiring continuing despite broader tech layoffs.',
      'Power systems expertise becoming critical differentiator.',
    ],
    'cooling-thermal': [
      'Thermal engineers in high demand as cooling becomes critical.',
      'New roles for liquid cooling specialists appearing.',
      'HVAC expertise being cross-trained for data center applications.',
      'Cooling startups attracting talent from established HVAC companies.',
    ],
    'interconnects-networking': [
      'Networking engineers remain in demand. Steady hiring across sector.',
      'Optical networking expertise particularly valued.',
      'Silicon photonics talent increasingly competitive.',
      'AI cluster networking roles growing faster than traditional networking.',
    ],
  },
  government: {
    'lithography-fabs': [
      'CHIPS Act funding decisions accelerating. Multiple awards announced.',
      'EU Chips Act providing substantial funding for European capacity.',
      'Japan and Korea both increasing semiconductor incentives.',
      'Multi-year programs now operational across US, EU, and Asia.',
    ],
    'advanced-packaging': [
      'Packaging R&D receiving dedicated government support.',
      'CHIPS Act explicitly includes advanced packaging in funding scope.',
      'Japan prioritizing packaging technology development.',
      'Multiple countries recognizing packaging as strategic capability.',
    ],
    'power-generation': [
      'DOE announcing grid modernization funding. AI power demand cited.',
      'Nuclear policy discussions gaining momentum in Congress.',
      'State-level incentives for data center power infrastructure.',
      'Federal support for next-gen power technologies increasing.',
    ],
    'cooling-thermal': [
      'Energy efficiency mandates driving cooling innovation.',
      'Government incentives for sustainable cooling technologies.',
      'Policy discussions on data center environmental impact.',
      'R&D funding for advanced cooling technologies announced.',
    ],
    'interconnects-networking': [
      'Networking infrastructure included in federal tech priorities.',
      'Optical networking R&D receiving DOE support.',
      'Government focus on domestic networking supply chain.',
      'Defense applications driving networking technology investment.',
    ],
  },
  narrative: {
    'lithography-fabs': [
      'ASML coverage increasing. Lithography becoming mainstream topic.',
      'Semiconductor manufacturing in major news outlets regularly.',
      'Fab construction stories appearing in general business press.',
      'Elevated attention but not yet consensus trade.',
    ],
    'advanced-packaging': [
      'CoWoS term appearing in mainstream financial media.',
      'Advanced packaging gaining mindshare among generalist investors.',
      'NVIDIA earnings driving packaging narrative attention.',
      'Becoming consensus view. Potential for crowded positioning.',
    ],
    'power-generation': [
      'Data center power starting to appear in energy sector coverage.',
      'AI power demand narrative still emerging. Not yet crowded.',
      'Early innings of narrative development. Limited retail attention.',
      'Nuclear for AI becoming talked about but not consensus.',
    ],
    'cooling-thermal': [
      'Cooling largely under the radar. Limited mainstream coverage.',
      'Niche topic. Most coverage in specialized trade publications.',
      'Low narrative saturation. Potential asymmetric opportunity.',
      'Beginning to see more mentions but still early.',
    ],
    'interconnects-networking': [
      'Networking AI theme moderately covered. Not overheated.',
      'InfiniBand and networking discussion increasing.',
      'Broadcom AI narrative gaining attention.',
      'Balanced coverage. Some attention but not bubble-like.',
    ],
  },
};

// Generate mocked signal records with rationales
export function generateMockSignalRecords(): WeeklySignalRecord[] {
  const weeks = generateWeeks(12);
  const records: WeeklySignalRecord[] = [];

  SUBTHEMES.forEach(subtheme => {
    weeks.forEach((week, weekIndex) => {
      // Generate scores with progression
      const baseScores: Record<SignalType, number> = {
        capex: Math.min(30, 15 + Math.floor(weekIndex * 1.2) + (subtheme.id === 'lithography-fabs' ? 5 : 0)),
        constraint: Math.min(25, 12 + Math.floor(weekIndex * 0.8) + (subtheme.id === 'advanced-packaging' ? 5 : 0)),
        hiring: Math.min(15, 8 + Math.floor(weekIndex * 0.4) + (weekIndex > 8 ? 3 : 0)),
        government: Math.min(15, 6 + Math.floor(weekIndex * 0.3) + (weekIndex > 4 ? 2 : 0)),
        narrative: Math.min(15, 3 + Math.floor(weekIndex * 0.4) + (subtheme.id === 'advanced-packaging' ? 3 : 0)),
      };

      // Adjust scores based on subtheme characteristics
      if (subtheme.id === 'power-generation') {
        baseScores.capex = Math.min(30, 10 + Math.floor(weekIndex * 1.5));
        baseScores.constraint = Math.min(25, 8 + Math.floor(weekIndex * 1.0));
        baseScores.narrative = Math.min(15, 2 + Math.floor(weekIndex * 0.3));
      } else if (subtheme.id === 'cooling-thermal') {
        baseScores.capex = Math.min(30, 8 + Math.floor(weekIndex * 0.8));
        baseScores.constraint = Math.min(25, 6 + Math.floor(weekIndex * 0.5));
        baseScores.narrative = Math.min(15, 1 + Math.floor(weekIndex * 0.2));
      }

      SIGNALS.forEach(signal => {
        const rationales = MOCK_RATIONALES[signal.id][subtheme.id];
        const rationaleIndex = Math.floor(weekIndex / 3) % rationales.length;
        
        records.push({
          weekId: week,
          subthemeId: subtheme.id,
          signalType: signal.id,
          scoreValue: baseScores[signal.id],
          analystRationale: rationales[rationaleIndex],
          createdAt: new Date(week).toISOString(),
        });
      });
    });
  });

  return records;
}

// Generate mock weekly data from records
const MOCK_RECORDS = generateMockSignalRecords();

export const WEEKLY_DATA: WeeklySubthemeData[] = convertRecordsToWeeklyData(MOCK_RECORDS);

export const SIGNAL_RECORDS: WeeklySignalRecord[] = MOCK_RECORDS;

// Company data with exposures
export const DEFAULT_COMPANIES: Company[] = [
  {
    id: 'asml',
    name: 'ASML Holding',
    ticker: 'ASML',
    description: 'Leading lithography equipment supplier for semiconductor manufacturing',
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
    description: 'Leading AI accelerator and GPU company',
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
    description: 'World\'s largest semiconductor foundry',
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
    description: 'Solid oxide fuel cell power generation systems',
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
    description: 'Critical digital infrastructure and cooling solutions',
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
    description: 'Semiconductor and infrastructure software company',
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
    description: 'Semiconductor equipment and services',
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
    description: 'Semiconductor processing equipment',
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
    description: 'Clean energy generation and trading',
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
    description: 'High-performance fiber laser and optical solutions',
    isPublic: false,
    exposures: [
      { subthemeId: 'interconnects-networking', percentage: 70 },
      { subthemeId: 'lithography-fabs', percentage: 30 },
    ],
  },
];

// For backward compatibility
export const COMPANIES = DEFAULT_COMPANIES;

// Find the driver signal for a score change
export function findDriverSignal(
  currentSignals: WeeklySignalData,
  previousSignals: WeeklySignalData
): { signal: SignalType; delta: number } {
  const deltas: { signal: SignalType; delta: number }[] = [
    { signal: 'capex', delta: currentSignals.capexMomentum - previousSignals.capexMomentum },
    { signal: 'constraint', delta: currentSignals.constraintTightness - previousSignals.constraintTightness },
    { signal: 'hiring', delta: currentSignals.hiringPressure - previousSignals.hiringPressure },
    { signal: 'government', delta: currentSignals.governmentSupport - previousSignals.governmentSupport },
    { signal: 'narrative', delta: -(currentSignals.narrativeSaturation - previousSignals.narrativeSaturation) }, // Inverted because negative weight
  ];

  return deltas.reduce((max, curr) => 
    Math.abs(curr.delta) > Math.abs(max.delta) ? curr : max
  );
}

// Generate alerts based on data
export function generateAlerts(data: WeeklySubthemeData[]): Alert[] {
  const alerts: Alert[] = [];
  const weeks = [...new Set(data.map(d => d.week))].sort();
  const latestWeek = weeks[weeks.length - 1];
  const previousWeek = weeks[weeks.length - 2];
  const fourWeeksAgo = weeks[weeks.length - 5];

  SUBTHEMES.forEach(subtheme => {
    const latestData = data.find(d => d.week === latestWeek && d.subthemeId === subtheme.id);
    const prevData = data.find(d => d.week === previousWeek && d.subthemeId === subtheme.id);
    const oldData = data.find(d => d.week === fourWeeksAgo && d.subthemeId === subtheme.id);

    if (!latestData || !prevData) return;

    // Find driver signal for alerts
    const driver = findDriverSignal(latestData.signals, prevData.signals);

    // Breakout Alert: Score > 65 for 2 consecutive weeks
    if (latestData.totalScore > 65 && prevData.totalScore > 65) {
      alerts.push({
        id: `breakout-${subtheme.id}`,
        type: 'breakout',
        subthemeId: subtheme.id,
        message: `${subtheme.name} showing sustained pressure above 65`,
        timestamp: latestWeek,
        score: latestData.totalScore,
        triggeringRationale: latestData.signalRationales?.[driver.signal] || '',
        driverSignal: driver.signal,
      });
    }

    // Acceleration Alert: +15 increase within 30 days
    if (oldData && latestData.totalScore - oldData.totalScore >= 15) {
      const accelerationDriver = findDriverSignal(latestData.signals, oldData.signals);
      alerts.push({
        id: `acceleration-${subtheme.id}`,
        type: 'acceleration',
        subthemeId: subtheme.id,
        message: `${subtheme.name} accelerating rapidly (+${latestData.totalScore - oldData.totalScore} in 4 weeks)`,
        timestamp: latestWeek,
        delta: latestData.totalScore - oldData.totalScore,
        triggeringRationale: latestData.signalRationales?.[accelerationDriver.signal] || '',
        driverSignal: accelerationDriver.signal,
      });
    }

    // Hype Warning: Narrative rising faster than fundamentals
    const narrativeChange = latestData.signals.narrativeSaturation - (prevData?.signals.narrativeSaturation || 0);
    const fundamentalChange = (
      (latestData.signals.capexMomentum - (prevData?.signals.capexMomentum || 0)) +
      (latestData.signals.constraintTightness - (prevData?.signals.constraintTightness || 0)) +
      (latestData.signals.hiringPressure - (prevData?.signals.hiringPressure || 0)) +
      (latestData.signals.governmentSupport - (prevData?.signals.governmentSupport || 0))
    ) / 4;

    if (narrativeChange > fundamentalChange + 1 && latestData.signals.narrativeSaturation > 6) {
      alerts.push({
        id: `hype-${subtheme.id}`,
        type: 'hype',
        subthemeId: subtheme.id,
        message: `${subtheme.name}: Narrative outpacing fundamentals`,
        timestamp: latestWeek,
        triggeringRationale: latestData.signalRationales?.narrative || '',
        driverSignal: 'narrative',
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

// Calculate 4-week average delta for a company
export function calculateCompany4WeekDelta(
  company: Company,
  data: WeeklySubthemeData[]
): number {
  const weeks = [...new Set(data.map(d => d.week))].sort();
  if (weeks.length < 5) return 0;

  const latestWeek = weeks[weeks.length - 1];
  const fourWeeksAgo = weeks[weeks.length - 5];

  const getScoresForWeek = (week: string): Record<SubthemeId, number> => {
    const scores: Record<SubthemeId, number> = {} as any;
    SUBTHEMES.forEach(s => {
      const weekData = data.find(d => d.week === week && d.subthemeId === s.id);
      scores[s.id] = weekData?.totalScore || 0;
    });
    return scores;
  };

  const latestScores = getScoresForWeek(latestWeek);
  const oldScores = getScoresForWeek(fourWeeksAgo);

  const latestCompanyScore = calculateCompanyPressureScore(company, latestScores);
  const oldCompanyScore = calculateCompanyPressureScore(company, oldScores);

  return latestCompanyScore - oldCompanyScore;
}
