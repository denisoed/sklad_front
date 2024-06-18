import { defineStore } from 'pinia';

export const useSizesStore = defineStore('sizes', {
  state: () => ({
    sizes: [],
  }),
  getters: {
    getSizes: state => state.sizes,
  },
  actions: {
    setSizes(list) {
      this.sizes = list;
    },
  },
});