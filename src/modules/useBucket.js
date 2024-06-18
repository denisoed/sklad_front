import { computed } from 'vue'
import { SALE_PRODUCTS } from 'src/graphql/types'
import { useLazyQuery } from '@vue/apollo-composable'

const useBucket = () => {
  const {
    result,
    load: loadBucketProducts,
    loading: bucketProductsLoading,
    refetch: refetchBucketProducts,
    error: errorBucketProducts
  } = useLazyQuery(SALE_PRODUCTS)

  const bucketProducts = computed(() => result.value?.saleProducts || [])
  const bucketProductsCount = computed(() => result.value?.saleProducts?.length || 0)

  return {
    errorBucketProducts,
    refetchBucketProducts,
    bucketProductsLoading,
    bucketProducts,
    bucketProductsCount,
    loadBucketProducts,
  }
}

export default useBucket
