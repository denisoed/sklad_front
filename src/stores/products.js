import { defineStore } from 'pinia';

export const useProductsStore = defineStore('products', {
  state: () => ({
    productsWithMinSizes: [],
  }),
  getters: {
    getProductsWithMinSizes: state => state.productsWithMinSizes,
  },
  actions: {
    setProductsWithMinSizes(list) {
      this.productsWithMinSizes = list;
    },
  },
});
