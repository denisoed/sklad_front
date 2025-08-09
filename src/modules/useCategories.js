import {
  CATEGORIES
} from 'src/graphql/category'
import { apolloClient } from 'src/boot/apollo'
import { useCategoriesStore } from 'src/stores/categories'
import useHelpers from 'src/modules/useHelpers'
import { computed, ref } from 'vue'

const useCategories = () => {
  const categoriesStore = useCategoriesStore()
  const { showError } = useHelpers()

  const categoriesLoading = ref(false)

  const categories = computed(() => categoriesStore.getCategories)
  
  async function fetchCategories(where = {}) {
    try {
      categoriesLoading.value = true;
      const { data } = await apolloClient.query({
        query: CATEGORIES,
        variables: {
          where
        },
        fetchPolicy: 'network-only'
      })
      categoriesStore.setCategories(data?.categories)
    } catch (error) {
      console.log(error);
      showError($t('common.unknownError') + '. ' + $t('common.reloadApp'))
    } finally {
      categoriesLoading.value = false;
    }
  }

  return {
    categoriesLoading,
    fetchCategories,
    categories
  }
}

export default useCategories
