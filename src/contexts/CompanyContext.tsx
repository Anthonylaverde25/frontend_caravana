import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setGlobalHeaders, removeGlobalHeaders } from '@/utils/axios';
import useUser from '@auth/useUser';

interface Company {
  id: number;
  name: string;
  renspa?: string;
  location?: string;
  is_active: boolean;
  role: string;
}

interface CompanyContextType {
  activeCompanyId: number | null;
  setActiveCompanyId: (id: number | null) => void;
  companies: Company[];
  loading: boolean;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: user } = useUser();
  
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

  // Save to localStorage when it changes and set global header
  useEffect(() => {
    if (activeCompanyId) {
      localStorage.setItem('activeCompanyId', activeCompanyId.toString());
      setGlobalHeaders({ 'X-Company-ID': activeCompanyId.toString() });
    } else {
      localStorage.removeItem('activeCompanyId');
      removeGlobalHeaders(['X-Company-ID']);
    }
  }, [activeCompanyId]);

  return (
    <CompanyContext.Provider value={{ activeCompanyId, setActiveCompanyId, companies, loading, error }}>
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
