<template>
  <div class="ble flex column q-gap-md block-bg">
    <div class="flex items-center justify-between q-gap-md">
      <h6 class="q-ma-none text-grey-5 text-subtitle1">Подключение к принтеру</h6>
      <q-icon v-if="bluetoothConnected" size="sm" color="primary" name="mdi-printer-check" />
      <q-icon v-else size="sm" color="deep-orange" name="mdi-printer-off" />
    </div>
    <q-separator />
    <div class="flex column full-width">
      <ul v-if="bluetoothDevices?.length" class="flex column q-gap-sm no-margin no-padding">
        <li v-for="device of bluetoothDevices" :key="device?.name" class="full-width flex items-center justify-start q-gap-md q-mb-sm ble-item">
          <div class="flex column q-mr-auto">
            <span
              :class="{ 'text-green text-bold': bluetoothDevice?.id === device?.id }"
            >
              {{ device?.name }}
            </span>
            <span v-if="bluetoothAutoConnecting" class="text-grey-5 text-caption">Авто подключение...</span>
          </div>
          <q-btn
            v-if="bluetoothDevice?.id === device?.id"
            push
            icon="mdi-dots-horizontal"
            class="text-primary"
            round
            dense
            v-vibrate
          >
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup>
                  <q-item-section @click="openedBleEditorDialog = true">
                    Редактировать
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section
                    class="text-deep-orange"
                    @click="disconnectDevice(device.id)"
                  >
                    Удалить
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn
            v-else
            :loading="connectLoading && deviceForConnect === device?.id || bluetoothAutoConnecting"
            push
            @click="connectDevice(device?.id)"
            icon="mdi-plus"
            :color="bluetoothAutoConnecting ? 'grey' : 'green'"
            :disable="bluetoothAutoConnecting"
            round
            dense
            v-vibrate
          />
        </li>
      </ul>
      <span v-else class="text-grey-5 text-center text-subtitle2 q-my-md">
        {{ bluetoothScanning ? 'Поиск устройств...' : 'Нет подключенных устройств' }}
      </span>
    </div>

    <div class="flex justify-center no-wrap q-gap-md">
      <q-btn
        v-if="bluetoothScanning"
        round
        size="lg"
        color="primary"
        push
        @click="bluetoothStopScan"
        v-vibrate
      >
        <q-spinner />
      </q-btn>
      <q-btn
        v-else
        round
        size="lg"
        color="primary"
        push
        :loading="bluetoothScanning"
        @click="bluetoothScan"
        icon="mdi-bluetooth"
        v-vibrate
      />
    </div>

    <BleEditorDialog
      :opened="openedBleEditorDialog"
      :users="skladUsers"
      @on-close="openedBleEditorDialog = false"
      @on-save="onSave"
    />
  </div>
</template>

<script>
import { LocalStorage } from 'quasar'
import { defineComponent, ref, watch } from 'vue'
import useBluetooth from 'src/modules/ble/useBluetooth'
import useHelpers from 'src/modules/useHelpers'
import BleEditorDialog from 'src/components/Ble/BleEditorDialog'

export default defineComponent({
  name: 'BleConnector',
  components: {
    BleEditorDialog,
  },
  setup() {
    const {
      bluetoothScan,
      bluetoothScanning,
      bluetoothAutoConnecting,
      bluetoothDevices,
      bluetoothDisconnect,
      bluetoothRemoveConnectedDevice,
      bluetoothConnected,
      bluetoothConnect,
      bluetoothStopScan,
      bluetoothDevice,
      bluetoothDesktopSelectedDevice
    } = useBluetooth()
    const { showSuccess } = useHelpers()

    const deviceForConnect = ref(null)
    const connectLoading = ref(false)
    const openedBleEditorDialog = ref(false)
    
    function disconnectDevice(id) {
      bluetoothRemoveConnectedDevice()
      deviceForConnect.value = null
      bluetoothDisconnect(id)
    }

    async function connectDevice(id) {
      connectLoading.value = true
      bluetoothStopScan()
      if (bluetoothDevice.value) {
        await disconnectDevice(bluetoothDevice.value.id)
      }
      deviceForConnect.value = id
      await bluetoothConnect(id)
      connectLoading.value = false
      deviceForConnect.value = null
    }

    function onSave(payload) {
      const savedDevice = LocalStorage.getItem('sklad-ble-device')
      if (savedDevice) {
        const newData = {
          ...savedDevice,
          ...payload,
        }
        LocalStorage.set('sklad-ble-device', newData)
        showSuccess('Изменения сохранены')
      }
    }

    watch(bluetoothDesktopSelectedDevice, (d) => {
      if (d) {
        setTimeout(() => {
          openedBleEditorDialog.value = true
        }, 1000);
      }
    })

    return {
      connectDevice,
      bluetoothConnected,
      bluetoothDevice,
      connectLoading,
      deviceForConnect,
      disconnectDevice,
      bluetoothStopScan,
      bluetoothScan,
      bluetoothScanning,
      bluetoothDevices,
      bluetoothAutoConnecting,
      openedBleEditorDialog,
      onSave,
    }
  }
})
</script>

<style lang="scss" scoped>
  .ble {
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 20px;
  }
  
  .ble-item {
    padding: 10px;
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
  }

  span {
    line-height: normal;
  }
</style>
