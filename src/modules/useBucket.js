import { computed, watch } from 'vue'
import { SALE_PRODUCTS } from 'src/graphql/types'
import { useLazyQuery } from '@vue/apollo-composable'
import { useBucketStore } from 'src/stores/bucket'

const useBucket = () => {
  const bucketStore = useBucketStore()
  
  const {
    result,
    load: loadBucketProducts,
    loading: bucketProductsLoading,
    refetch: refetchBucketProducts,
    error: errorBucketProducts
  } = useLazyQuery(SALE_PRODUCTS, {}, {
    onResult: (result) => {
      if (result?.data?.saleProducts) {
        bucketStore.setBucketProducts(result.data.saleProducts)
      }
    }
  })

  const bucketProducts = computed(() => bucketStore.getBucketProducts)
  const bucketProductsCount = computed(() => bucketStore.getBucketProductsCount)

  // Watch result changes to sync with store (handles all cases including page reload)
  watch(result, (newResult) => {
    if (newResult?.saleProducts) {
      bucketStore.setBucketProducts(newResult.saleProducts)
    }
  }, { immediate: true, deep: true })

  // Watch loading state and update store
  watch(bucketProductsLoading, (loading) => {
    bucketStore.setLoading(loading)
  }, { immediate: true })

  // Force refresh bucket data with immediate store update
  async function forceRefreshBucket() {
    try {
      const refreshedResult = await refetchBucketProducts()
      if (refreshedResult?.data?.saleProducts) {
        bucketStore.setBucketProducts(refreshedResult.data.saleProducts)
      }
    } catch (error) {
      console.error('Failed to refresh bucket data:', error)
    }
  }

  return {
    errorBucketProducts,
    refetchBucketProducts,
    forceRefreshBucket,
    bucketProductsLoading,
    bucketProducts,
    bucketProductsCount,
    loadBucketProducts,
  }
}

export default useBucket
