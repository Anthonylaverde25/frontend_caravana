export interface CaravanMovement {
  id: number;
  renspa: string;
  type: 'ORIGIN' | 'ENTRY' | 'EXIT' | 'TRANSFER';
  movementDate: string;
  observations?: string;
}
