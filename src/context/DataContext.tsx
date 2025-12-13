import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  WeeklySignalRecord,
  Company,
  WeeklySubthemeData,
  SubthemeId,
  SignalType,
  SIGNAL_RECORDS,
  DEFAULT_COMPANIES,
  convertRecordsToWeeklyData,
  generateAlerts,
  Alert,
} from '@/data/mockData';

interface DataContextType {
  // Signal records (the source of truth)
  signalRecords: WeeklySignalRecord[];
  addSignalRecords: (records: WeeklySignalRecord[]) => void;
  
  // Companies
  companies: Company[];
  addCompany: (company: Company) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  
  // Derived data
  weeklyData: WeeklySubthemeData[];
  alerts: Alert[];
  
  // Available weeks
  availableWeeks: string[];
  latestWeek: string;
  
  // Get previous week data for a signal
  getPreviousWeekScore: (weekId: string, subthemeId: SubthemeId, signalType: SignalType) => number | null;
  getSignalRationale: (weekId: string, subthemeId: SubthemeId, signalType: SignalType) => string | null;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEYS = {
  SIGNAL_RECORDS: 'signal-dashboard-records',
  COMPANIES: 'signal-dashboard-companies',
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [signalRecords, setSignalRecords] = useState<WeeklySignalRecord[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SIGNAL_RECORDS);
    return stored ? JSON.parse(stored) : SIGNAL_RECORDS;
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return stored ? JSON.parse(stored) : DEFAULT_COMPANIES;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIGNAL_RECORDS, JSON.stringify(signalRecords));
  }, [signalRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  }, [companies]);

  // Add new signal records
  const addSignalRecords = useCallback((records: WeeklySignalRecord[]) => {
    setSignalRecords(prev => {
      // Remove any existing records for the same week/subtheme/signal combination
      const newKeys = new Set(records.map(r => `${r.weekId}-${r.subthemeId}-${r.signalType}`));
      const filtered = prev.filter(r => !newKeys.has(`${r.weekId}-${r.subthemeId}-${r.signalType}`));
      return [...filtered, ...records];
    });
  }, []);

  // Company management
  const addCompany = useCallback((company: Company) => {
    setCompanies(prev => [...prev, company]);
  }, []);

  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCompany = useCallback((id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  }, []);

  // Derived data
  const weeklyData = useMemo(() => convertRecordsToWeeklyData(signalRecords), [signalRecords]);
  const alerts = useMemo(() => generateAlerts(weeklyData), [weeklyData]);

  const availableWeeks = useMemo(() => {
    return [...new Set(signalRecords.map(r => r.weekId))].sort();
  }, [signalRecords]);

  const latestWeek = useMemo(() => {
    return availableWeeks[availableWeeks.length - 1] || new Date().toISOString().split('T')[0];
  }, [availableWeeks]);

  // Helper to get previous week's score
  const getPreviousWeekScore = useCallback((weekId: string, subthemeId: SubthemeId, signalType: SignalType): number | null => {
    const weekIndex = availableWeeks.indexOf(weekId);
    if (weekIndex <= 0) return null;
    
    const prevWeek = availableWeeks[weekIndex - 1];
    const record = signalRecords.find(
      r => r.weekId === prevWeek && r.subthemeId === subthemeId && r.signalType === signalType
    );
    return record?.scoreValue ?? null;
  }, [signalRecords, availableWeeks]);

  // Get rationale for a specific signal
  const getSignalRationale = useCallback((weekId: string, subthemeId: SubthemeId, signalType: SignalType): string | null => {
    const record = signalRecords.find(
      r => r.weekId === weekId && r.subthemeId === subthemeId && r.signalType === signalType
    );
    return record?.analystRationale ?? null;
  }, [signalRecords]);

  const value: DataContextType = {
    signalRecords,
    addSignalRecords,
    companies,
    addCompany,
    updateCompany,
    deleteCompany,
    weeklyData,
    alerts,
    availableWeeks,
    latestWeek,
    getPreviousWeekScore,
    getSignalRationale,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
