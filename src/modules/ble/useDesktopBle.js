import { LocalStorage } from 'quasar'
import { useBluetooth } from '@vueuse/core'
import { useBleStore } from 'src/stores/ble'

const DEVICE_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb'
const DEVICE_CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb'

const useDesktopBle = () => {
  const bleStore = useBleStore()
  const {
    requestDevice,
    device,
    isConnected,
    isSupported,
    error
  } = useBluetooth({
    acceptAllDevices: true,
    optionalServices: [
      DEVICE_SERVICE_UUID
    ]
  })
  
  async function desktopBleScan() {
    await requestDevice()
  }

  async function desktopBleConnect(device) {
    const gattServer = await device.gatt.connect()
    const connectedService = await gattServer.getPrimaryService(DEVICE_SERVICE_UUID)
    const connectedCharacteristic = await connectedService.getCharacteristic(DEVICE_CHARACTERISTIC_UUID)
    bleStore.setConnected(true)
    bleStore.setDevice(device)
    bleStore.setServer(connectedCharacteristic)
    const savedDevice = LocalStorage.getItem('sklad-ble-device')
    if (!savedDevice) {
      LocalStorage.set('sklad-ble-device', { id: device.id, name: device.name })
    }
  }

  async function desktopBleWrite(data) {
    await bleStore.getServer.writeValue(data)
  }

  async function desktopBleDisconnect() {
    await bleStore.getDevice.forget()
    LocalStorage.remove('sklad-ble-device')
    bleStore.setDevice(null)
    bleStore.setServer(null)
  }

  async function desktopBleAutoConnect(savedDeviceId) {
    const listDevices = await navigator.bluetooth.getDevices();
    const findedDevice = listDevices.find((dev) => dev.id === savedDeviceId);
    if (findedDevice) {
      await desktopBleConnect(findedDevice)
    }
  }

  return {
    desktopBleScan,
    desktopSeletedDevice: device,
    desktopBleIsConnected: isConnected,
    desktopBleIsSupported: isSupported,
    desktopBleError: error,
    desktopBleConnect,
    desktopBleWrite,
    desktopBleAutoConnect,
    desktopBleDisconnect
  }
}

export default useDesktopBle
