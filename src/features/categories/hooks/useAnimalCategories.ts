import { useQuery } from '@tanstack/react-query';
import { ApiAnimalCategoryRepository } from '@/core/categories/infrastructure/repositories/ApiAnimalCategoryRepository';
import { ListAnimalCategoriesUseCase } from '@/core/categories/application/use-cases/ListAnimalCategoriesUseCase';
import { AnimalCategory, AnimalSubcategory } from '@/core/categories/domain/entities/AnimalCategory';

const categoryRepository = new ApiAnimalCategoryRepository();
const listAnimalCategoriesUseCase = new ListAnimalCategoriesUseCase(categoryRepository);

export function useAnimalCategories() {
  const query = useQuery<AnimalCategory[]>({
    queryKey: ['animal-categories'],
    queryFn: () => listAnimalCategoriesUseCase.execute(),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  const categories = query.data ?? [];

  const getCategoryById = (id: number | null | undefined): AnimalCategory | undefined => {
    if (!id) return undefined;
    return categories.find((c) => c.id === id);
  };

  const getCategoryByCode = (code: string | null | undefined): AnimalCategory | undefined => {
    if (!code) return undefined;
    const normalized = code.trim().toUpperCase();
    return categories.find((c) => c.code.toUpperCase() === normalized);
  };

  const getCategoryOptions = () => {
    return categories.map((c) => ({
      value: c.id,
      label: c.name,
      code: c.code,
      sex: c.sex,
      is_reproductive: c.is_reproductive,
      min_weight_kg: c.min_weight_kg,
      max_weight_kg: c.max_weight_kg,
      subcategories: c.subcategories || [],
    }));
  };

  const getSubcategoryOptions = (categoryId: number | null | undefined) => {
    if (!categoryId) return [];
    const cat = getCategoryById(categoryId);
    if (!cat || !cat.subcategories) return [];
    return cat.subcategories.map((sub) => ({
      value: sub.id,
      label: sub.name,
      code: sub.code,
      target_weight_min: sub.target_weight_min,
      target_weight_max: sub.target_weight_max,
      description: sub.description,
    }));
  };

  return {
    ...query,
    categories,
    getCategoryById,
    getCategoryByCode,
    getCategoryOptions,
    getSubcategoryOptions,
  };
}
