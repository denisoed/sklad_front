import { defineStore } from 'pinia';

export const useBulkStore = defineStore('bulk', {
  state: () => ({
    bulkProducts: [],
  }),
  getters: {
    getBulkProducts: (state) => state.bulkProducts
  },
  actions: {
    setBulkProducts(list) {
      this.bulkProducts = list;
    },
    removeBulkProduct(id) {
      this.bulkProducts = this.bulkProducts.filter(p => p.id !== id)
    }
  },
});
