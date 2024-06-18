import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    permissions: null,
  }),
  getters: {
    getPermissions: state => state.permissions,
  },
  actions: {
    setPermissions(payload) {
      this.permissions = payload;
    },
  },
});