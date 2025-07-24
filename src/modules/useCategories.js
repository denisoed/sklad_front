import {
  CATEGORIES
} from 'src/graphql/category'
import { useLazyQuery } from '@vue/apollo-composable'

const useCategories = () => {
  const {
    result: categoriesResult,
    loading: categoriesLoading,
    load: loadCategories,
    refetch: refetchCategories
  } = useLazyQuery(CATEGORIES)

  return {
    categoriesResult,
    categoriesLoading,
    loadCategories,
    refetchCategories
  }
}

export default useCategories
