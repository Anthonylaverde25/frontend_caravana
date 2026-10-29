export interface CaravanMovement {
  id: number;
  identification?: string;
  renspa: string;
  type: 'ORIGIN' | 'ENTRY' | 'EXIT' | 'TRANSFER' | 'SALE' | 'DEATH';
  movementDate: string;
  observations?: string;
}
