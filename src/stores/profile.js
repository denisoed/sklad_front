import { defineStore } from 'pinia';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
  }),
  getters: {
    getProfile: state => state.profile,
  },
  actions: {
    setProfile(payload) {
      this.profile = payload;
    },
  },
});