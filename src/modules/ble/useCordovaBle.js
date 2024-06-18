import { LocalStorage } from 'quasar'
import { useBleStore } from 'src/stores/ble'

const useCordovaBle = () => {
  const bleStore = useBleStore()

  function cordovaBleStopScan() {
    ble.stopScan();
  }
  
  async function cordovaBleScan(successCallback, errorCallback, finallyCallback) {
    await ble.withPromises.startScan([], (response) => {
      successCallback(response);
      finallyCallback();
      return response
    }, () => {
      errorCallback();
      finallyCallback();
    });
    // Stop scanning after 60 seconds if no device is found
    setTimeout(cordovaBleStopScan, 60000)
  }

  function cordovaBleAutoConnect(deviceId, successCallback, errorCallback, finallyCallback, timeout) {
    ble.autoConnect(deviceId, (response) => {
      const configs = response.characteristics.find(
        c => c.properties.includes('Read') && c.properties.includes('Write')
      )
      const savedDevice = LocalStorage.getItem('sklad-ble-device')
      const device = {
        id: response.id,
        name: response.name,
        service: configs.service,
        characteristic: configs,
        ...(savedDevice ? savedDevice : {})
      }
      LocalStorage.set('sklad-ble-device', device)
      bleStore.setConnected(true)
      bleStore.setDevice(device)
      successCallback(response);
      finallyCallback();
    }, () => {
      LocalStorage.remove('sklad-ble-device')
      errorCallback();
      finallyCallback();
    }, timeout);
  }

  async function cordovaBleConnect(deviceId, successCallback, errorCallback) {
    ble.withPromises.connect(deviceId, (response) => {
      const configs = response.characteristics.find(
        c => c.properties.includes('Read') && c.properties.includes('Write')
      )
      const d = {
        id: response.id,
        name: response.name,
        service: configs.service,
        characteristic: configs.characteristic
      }
      bleStore.setConnected(true)
      bleStore.setDevice(d)
      LocalStorage.set('sklad-ble-device', d)
      successCallback(response);
    }, () => {
      errorCallback();
    });
  }

  function cordovaBleDisconnect(deviceId, successCallback, errorCallback) {
    ble.disconnect(deviceId, successCallback, errorCallback);
  }

  function cordovaBleDiscover(deviceId, successCallback, errorCallback) {
    ble.discover(deviceId, successCallback, errorCallback);
  }

  async function cordovaBleWrite(deviceId, serviceUUID, characteristicUUID, data, successCallback, errorCallback) {
    await ble.withPromises.write(deviceId, serviceUUID, characteristicUUID, data, successCallback, errorCallback);
  }

  function cordovaBleRead(deviceId, serviceUUID, characteristicUUID, successCallback, errorCallback) {
    ble.read(deviceId, serviceUUID, characteristicUUID, successCallback, errorCallback);
  }

  function cordovaBleStartNotification(deviceId, serviceUUID, characteristicUUID, successCallback, errorCallback) {
    ble.startNotification(deviceId, serviceUUID, characteristicUUID, successCallback, errorCallback);
  }

  function cordovaBleStopNotification(deviceId, serviceUUID, characteristicUUID, successCallback, errorCallback) {
    ble.stopNotification(deviceId, serviceUUID, characteristicUUID, successCallback, errorCallback);
  }

  return {
    cordovaBleScan,
    cordovaBleStopScan,
    cordovaBleAutoConnect,
    cordovaBleConnect,
    cordovaBleDisconnect,
    cordovaBleDiscover,
    cordovaBleWrite,
    cordovaBleRead,
    cordovaBleStartNotification,
    cordovaBleStopNotification
  }
};

export default useCordovaBle;
