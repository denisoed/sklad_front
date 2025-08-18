import { defineStore } from 'pinia';

export const useActivitiesStore = defineStore('activities', {
  state: () => ({
    listActivities: [],
    loading: false,
  }),
  getters: {
    getListActivities: (state) => state.listActivities,
    isLoading: (state) => state.loading,
  },
  actions: {
    setListActivities(activities) {
      this.listActivities = activities || [];
    },
    setLoadingActivities(loading) {
      this.loading = loading;
    },
  },
}); 