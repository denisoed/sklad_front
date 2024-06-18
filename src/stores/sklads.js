import { defineStore } from 'pinia';

export const useSkladsStore = defineStore('sklads', {
  state: () => ({
    sklad: null,
    sklads: [],
    skladProducts: [],
  }),
  getters: {
    getSklad: state => state.sklad,
    getSklads: state => state.sklads,
    getSkladProducts: state => state.skladProducts,
  },
  actions: {
    setSklad(payload) {
      this.sklad = payload;
    },
    setSklads(list) {
      this.sklads = list;
    },
    setSkladProducts(list) {
      this.skladProducts = list;
    },
  },
});