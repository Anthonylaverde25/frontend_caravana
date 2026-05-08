export interface CaravanMovement {
  id: number;
  identification?: string;
  renspa: string;
  type: 'ORIGIN' | 'ENTRY' | 'EXIT' | 'TRANSFER';
  movementDate: string;
  observations?: string;
}
