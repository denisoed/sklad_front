import { Platform, LocalStorage } from 'quasar'
import { computed, ref, watch } from 'vue'
import { useBleStore } from 'src/stores/ble'
import { storeToRefs } from 'pinia'
import useCordovaBle from 'src/modules/ble/useCordovaBle'
import useDesktopBle from 'src/modules/ble/useDesktopBle'
import useHelpers from 'src/modules/useHelpers'
import { useI18n } from 'vue-i18n'

const useBluetooth = () => {
  const {
    desktopBleScan,
    desktopBleAutoConnect,
    desktopSeletedDevice,
    desktopBleConnect,
    desktopBleDisconnect,
    desktopBleWrite
  } = useDesktopBle()
  const {
    cordovaBleScan,
    cordovaBleStopScan,
    cordovaBleAutoConnect,
    cordovaBleDisconnect,
    cordovaBleConnect,
    cordovaBleWrite
  } = useCordovaBle()
  const { showError } = useHelpers()
  const bleStore = useBleStore()
  const { t: $t } = useI18n()
  const { device } = storeToRefs(bleStore)

  const bluetoothDevices = ref([])

  function _disconnect() {
    bluetoothDevices.value = []
    bleStore.setConnected(false)
    bleStore.setDevice(null)
  }

  async function bluetoothScan() {
    bleStore.setScanning(true)
    if (Platform.is.desktop) {
      try {
        await desktopBleScan();
      } finally {
        bleStore.setScanning(false)
      }
    } else if (Platform.is.cordova) {
      await cordovaBleScan((d) => {
        const isValid = !bluetoothDevices.value.includes(d.name) && d.name.length
        if (isValid) {
          bluetoothDevices.value.push(d);
        }
      })
    } else {
      showError($t('useBluetooth_54'))
      bleStore.setScanning(false)
    }
  }
  
  function bluetoothStopScan() {
    if (Platform.is.cordova) {
      cordovaBleStopScan()
    }
    bleStore.setScanning(false)
  }

  function bluetoothConnect(deviceId, successCallback, errorCallback) {
    if (Platform.is.cordova) {
      cordovaBleConnect(
        deviceId,
        successCallback,
        errorCallback
      )
    }
  }

  async function bluetoothAutoConnect() {
    const savedDevice = LocalStorage.getItem('sklad-ble-device')
    if (savedDevice?.id) {
      bleStore.setAutoConnecting(true)
      if (Platform.is.desktop) {
        try {
          await desktopBleAutoConnect(savedDevice.id)
          bleStore.setAutoConnecting(false)
        } catch {
          bleStore.setAutoConnecting(false)
          bluetoothDevices.value = []
        }
      } else if (Platform.is.cordova) {
        cordovaBleAutoConnect(
          savedDevice.id,
          () => {},
          () => {},
          () => { bleStore.setAutoConnecting(false) },
          60000
        )
      }
    }
  }

  function bluetoothDisconnect(id, successCallback, errorCallback) {
    if (Platform.is.cordova) {
      cordovaBleDisconnect(id, () => {
        _disconnect()
        successCallback()
      }, errorCallback)
    } else if (Platform.is.desktop) {
      desktopBleDisconnect()
      _disconnect()
    }
  }

  async function bluetoothWrite(data) {
    if (Platform.is.desktop) {
      await desktopBleWrite(data);
    } else if (Platform.is.cordova) {
      const savedDevice = LocalStorage.getItem('sklad-ble-device')
      cordovaBleWrite(
        savedDevice.id,
        savedDevice.service,
        savedDevice.characteristic,
        data
      );
    }
  }

  function bluetoothRemoveConnectedDevice() {
    LocalStorage.remove('sklad-ble-device')
  }

  const bluetoothAutoConnecting = computed(() => bleStore.isAutoConnecting)
  const bluetoothScanning = computed(() => bleStore.isScanning)
  const bluetoothConnected = computed(() => bleStore.isConnected)
  const bluetoothDevice = computed(() => bleStore.getDevice)

  watch(device, (val) => {
    if (val) {
      bluetoothDevices.value = [val]
    }
  }, {
    immediate: true
  })

  watch(desktopSeletedDevice, async (d) => {
    if (d) {
      await desktopBleConnect(d);
    }
  })

  return {
    bluetoothScan,
    bluetoothScanning,
    bluetoothStopScan,
    bluetoothConnect,
    bluetoothDisconnect,
    bluetoothDevices,
    bluetoothConnected,
    bluetoothDevice,
    bluetoothAutoConnect,
    bluetoothWrite,
    bluetoothAutoConnecting,
    bluetoothRemoveConnectedDevice,
    bluetoothDesktopSelectedDevice: desktopSeletedDevice,
  }
}

export default useBluetooth