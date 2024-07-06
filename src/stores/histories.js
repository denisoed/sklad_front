import { defineStore } from 'pinia';

export const useHistoriesStore = defineStore('histories', {
  state: () => ({
    histories: [],
  }),
  getters: {
    getHistories: state => state.histories,
  },
  actions: {
    setHistories(histories) {
      this.histories = histories;
    },
  },
});
