import { defineStore } from 'pinia';

export const useCostsStore = defineStore('costs', {
  state: () => ({
    costs: [],
    loading: false,
  }),
  getters: {
    getCosts: (state) => state.costs,
    isLoading: (state) => state.loading,
  },
  actions: {
    setCosts(costs) {
      this.costs = costs || [];
    },
    setLoading(loading) {
      this.loading = loading;
    },
  },
}); 