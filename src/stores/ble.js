import { defineStore } from 'pinia';

export const useBleStore = defineStore('ble', {
  state: () => ({
    device: null,
    server: null,
    connected: false,
    scanning: false,
    autoConnecting: false,
  }),
  getters: {
    getDevice: state => state.device,
    getServer: state => state.server,
    isConnected: state => state.connected,
    isScanning: state => state.scanning,
    isAutoConnecting: state => state.autoConnecting
  },
  actions: {
    setServer(server) {
      this.server = server
    },
    setDevice(device) {
      this.device = device;
    },
    setConnected(status) {
      this.connected = status;
    },
    setScanning(status) {
      this.scanning = status;
    },
    setAutoConnecting(status) {
      this.autoConnecting = status;
    }
  },
});
