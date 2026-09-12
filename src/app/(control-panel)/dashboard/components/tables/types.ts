export type SanitaryStatus = 'APPROVED' | 'PENDING' | 'CRITICAL';

export type ToradaRatioStatus = 'OPTIMAL' | 'REINFORCEMENT' | 'WARNING';

export interface AlvRodeoLotRow {
  id: string | number;
  lotNumber: number;
  lotName: string;
  paddockName: string;
  statusColor: 'green' | 'amber' | 'blue' | 'red';
  category: string;
  femalesCount: number;
  malesCount: number;
  bullRatio: number;
  bullRatioLabel: string;
  bullRatioStatus: ToradaRatioStatus;
  sanitaryStatus: SanitaryStatus;
  sanitaryLabel: string;
  pregnancyRate: number;
  pregnancyModel: string;
}
