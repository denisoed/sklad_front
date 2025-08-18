import { defineStore } from 'pinia';

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    statisticActivities: {},
    loadingStatisticActivities: false,
    statisticFinance: {},
    loadingStatisticFinance: false,
    listCostsSum: [],
    loadingListCostsSum: false,
  }),
  getters: {
    getStatisticActivities: (state) => state.statisticActivities,
    getLoadingStatisticActivities: (state) => state.loadingStatisticActivities,
    getStatisticFinance: (state) => state.statisticFinance,
    getLoadingStatisticFinance: (state) => state.loadingStatisticFinance,
    getListCostsSum: (state) => state.listCostsSum,
    getLoadingListCostsSum: (state) => state.loadingListCostsSum,
  },
  actions: {
    setStatisticActivities(statisticActivities) {
      this.statisticActivities = statisticActivities || {};
    },
    setLoadingStatisticActivities(loadingStatisticActivities) {
      this.loadingStatisticActivities = loadingStatisticActivities || false;
    },
    setStatisticFinance(statisticFinance) {
      this.statisticFinance = statisticFinance || {};
    },
    setLoadingStatisticFinance(loadingStatisticFinance) {
      this.loadingStatisticFinance = loadingStatisticFinance || false;
    },
    setListCostsSum(listCostsSum) {
      this.listCostsSum = listCostsSum || [];
    },
    setLoadingListCostsSum(loadingListCostsSum) {
      this.loadingListCostsSum = loadingListCostsSum || false;
    },
  },
}); 