import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { Batch, BatchDTO } from '@/core/batches/domain/entities/Batch';

/**
 * useReserveBatch
 *
 * Hook to retrieve or auto-provision the System Reserve Batch (Lote Reserva | Animales Apartados).
 * Sends a GET request to /batches/reserve.
 */
export function useReserveBatch() {
  return useQuery({
    queryKey: ['batches', 'reserve'],
    queryFn: async (): Promise<Batch> => {
      const response = await axiosInstance.get<BatchDTO>('/batches/reserve');
      return Batch.create(response.data);
    },
  });
}
