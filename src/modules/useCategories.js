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
  const allUserCategories = computed(() => categoriesStore.getAllUserCategories)
  
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

  async function fetchAllUserCategories(skladsIds) {
    try {
      const { data } = await apolloClient.query({
        query: CATEGORIES,
        variables: {
          where: {
            sklad: {
              id_in: skladsIds
            }
          }
        },
        fetchPolicy: 'network-only'
      })
      categoriesStore.setAllUserCategories(data?.categories)
    } catch (error) {
      console.log(error);
      showError($t('common.unknownError') + '. ' + $t('common.reloadApp'))
    }
  }
  return {
    categoriesLoading,
    fetchCategories,
    fetchAllUserCategories,
    categories,
    allUserCategories
  }
}

export default useCategories
