import { defineStore } from 'pinia';

export const useProductsStore = defineStore('products', {
  state: () => ({
    productsWithMinSizes: [],
    products: [],
  }),
  getters: {
    getProductsWithMinSizes: state => state.productsWithMinSizes,
    getProducts: state => state.products,
  },
  actions: {
    setProductsWithMinSizes(list) {
      this.productsWithMinSizes = list;
    },
    setProducts(list) {
      this.products = list;
    },
  },
});
