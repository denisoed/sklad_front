import { defineStore } from 'pinia';

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [],
  }),
  getters: {
    getCategories: state => state.categories,
  },
  actions: {
    setCategories(categories) {
      this.categories = categories;
    },
  },
});
