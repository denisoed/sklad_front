import { defineStore } from 'pinia';

export const useBucketStore = defineStore('bucket', {
  state: () => ({
    bucketProducts: [],
    bucketProductsCount: 0,
    loading: false,
  }),
  getters: {
    getBucketProducts: (state) => state.bucketProducts,
    getBucketProductsCount: (state) => state.bucketProductsCount,
    isLoading: (state) => state.loading,
  },
  actions: {
    setBucketProducts(products) {
      this.bucketProducts = products || [];
      this.bucketProductsCount = products?.length || 0;
    },
    setBucketProductsCount(count) {
      this.bucketProductsCount = count || 0;
    },
    setLoading(loading) {
      this.loading = loading;
    },
  },
}); 