import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setGlobalHeaders, removeGlobalHeaders } from '@/utils/axios';
import useUser from '@auth/useUser';

export interface Company {
  id: number;
  name: string;
  renspa?: string;
  /** Digits only; null until the company loads it in Settings. */
  cuit?: string | null;
  location?: string;
  is_active: boolean;
  role: string;
}

interface CompanyContextType {
  activeCompanyId: number | null;
  setActiveCompanyId: (id: number | null) => void;
  companies: Company[];
  /** Replaces one company in memory after it was saved (no new login needed). */
  patchCompany: (company: Company) => void;
  loading: boolean;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  
  const [activeCompanyId, setActiveCompanyId] = useState<number | null>(() => {
    const saved = localStorage.getItem('activeCompanyId');
    return saved ? parseInt(saved, 10) : null;
  });
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync companies from user object
  useEffect(() => {
    if (user && user.companies) {
      setCompanies(user.companies as Company[]);
      
      // If there is no active company or the active one is not in the list, 
      // pick the first one by default
      if (user.companies.length > 0) {
        const companyIds = user.companies.map(c => c.id);
        if (!activeCompanyId || !companyIds.includes(activeCompanyId)) {
          setActiveCompanyId(user.companies[0].id);
        }
      }
    } else {
      setCompanies([]);
      setActiveCompanyId(null);
    }
  }, [user]);

  const handleSelectCompany = (id: number | null) => {
    if (id) {
      localStorage.setItem('activeCompanyId', id.toString());
      // The header goes first, so the refetch below already asks for the new company.
      setGlobalHeaders({ 'X-Company-ID': id.toString() });
    } else {
      localStorage.removeItem('activeCompanyId');
      removeGlobalHeaders(['X-Company-ID']);
    }
    // Every list in the cache belongs to the previous company (providers, batches, items...).
    // reset (not remove): the queries on screen are told to refetch, now with the new header.
    if (id !== activeCompanyId) {
      queryClient.resetQueries();
    }
    setActiveCompanyId(id);
  };

  // Save to localStorage when it changes and set global header
  useEffect(() => {
    if (activeCompanyId) {
      setGlobalHeaders({ 'X-Company-ID': activeCompanyId.toString() });
    } else {
      removeGlobalHeaders(['X-Company-ID']);
    }
  }, [activeCompanyId]);

  const patchCompany = (company: Company) =>
    setCompanies((current) => current.map((c) => (c.id === company.id ? { ...c, ...company } : c)));

  return (
    <CompanyContext.Provider value={{ activeCompanyId, setActiveCompanyId: handleSelectCompany, companies, patchCompany, loading, error }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany debe usarse dentro de un CompanyProvider');
  }
  return context;
};
