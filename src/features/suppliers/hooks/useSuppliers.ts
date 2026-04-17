import { useEffect, useState, useCallback } from 'react';
import { Supplier } from '@/core/suppliers/domain/entities/Supplier';
import { ListSuppliersUseCase } from '@/core/suppliers/application/use-cases/ListSuppliersUseCase';
import { ApiSupplierRepository } from '@/core/suppliers/infrastructure/repositories/ApiSupplierRepository';

/**
 * Hook to manage Suppliers state and logic.
 */
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Depedency Injection (Manual)
  const repository = new ApiSupplierRepository();
  const listUseCase = new ListSuppliersUseCase(repository);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUseCase.execute();
      setSuppliers(data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('No se pudieron cargar los proveedores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    refresh: fetchSuppliers,
  };
}
