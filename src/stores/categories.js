import { defineStore } from 'pinia';

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [],
    allUserCategories: [],
  }),
  getters: {
    getCategories: state => state.categories,
    getAllUserCategories: state => state.allUserCategories,
  },
  actions: {
    setCategories(categories) {
      this.categories = categories;
    },
    setAllUserCategories(categories) {
      this.allUserCategories = categories;
    },
  },
});
