<template>
  <BasicDialog ref="basicDialog" width="400px">
    <slot />
    <template #content>
      <div class="relative">
        <div v-if="!bluetoothConnected" class="flex column items-center">
          <p><b class="text-deep-orange">Принтер не подключен.</b> Чтобы продолжить печать, пожалуйста перейдите на страницу настроек.</p>
          <div class="flex justify-between full-width q-gap-md">
            <q-btn
              push
              label="Позже"
              @click="close"
            />
            <q-btn
              push
              color="primary"
              label="Настройки"
              to="/main-settings"
            />
          </div>
        </div>
        <div v-else-if="notConfigured" class="flex column items-center">
          <p><b class="text-deep-orange">Подключенный принтер не настроин.</b> Чтобы продолжить печать, нужно добавить настройки для DPI, ширины и высоты рабочей зоны.</p>
          <div class="flex justify-between full-width q-gap-md">
            <q-btn
              push
              label="Позже"
              @click="close"
            />
            <q-btn
              push
              color="primary"
              label="Настройки"
              to="/main-settings"
            />
          </div>
        </div>
        <BulkPreview
          v-else
          @on-next="submit"
          next-icon="mdi-check"
        />
        <q-inner-loading
          :showing="loading"
          label="Ожидайте..."
          color="primary"
        />
      </div>
    </template>
  </BasicDialog>
</template>

<script>
import { LocalStorage } from 'quasar'
import { defineComponent, ref, computed } from 'vue';
import BasicDialog from 'src/components/Dialogs/BasicDialog.vue';
import BulkPreview from 'src/components/Dialogs/Bulk/Preview.vue';
import useTSPL from 'src/modules/ble/useTSPL'
import useBluetooth from 'src/modules/ble/useBluetooth'
import useHelpers from 'src/modules/useHelpers'
import { useBulkStore } from 'src/stores/bulk'
import { useRoute } from 'vue-router'
import { formatPrice } from 'src/modules/usePriceFormatter'

export default defineComponent({
  name: 'BulkPrintDialog',
  components: {
    BasicDialog,
    BulkPreview,
  },
  emits: ['on-finish', 'on-error'],
  setup(_, { emit }) {
    const savedDevice = LocalStorage.getItem('sklad-ble-device')
    const { params } = useRoute()
    const bulkStore = useBulkStore()
    const { bluetoothWrite, bluetoothConnected } = useBluetooth()
    const { showSuccess, showError } = useHelpers()
    const {
      addTextField,
      addQrCode,
      addPrintQuantity,
      buildTsplMarkup,
    } = useTSPL({
      dpi: savedDevice?.dpi ? +savedDevice?.dpi : 0,
      width: savedDevice?.width ? +savedDevice?.width : 0,
      height: savedDevice?.height ? +savedDevice?.height : 0,
      offset: savedDevice?.offset ? +savedDevice?.offset : 0
    })

    const basicDialog = ref(null);
    const loading = ref(false);

    const notConfigured = computed(() => {
      const savedDevice = LocalStorage.getItem('sklad-ble-device')
      if (!savedDevice) return true
      if (savedDevice?.dpi && savedDevice?.width && savedDevice?.height) return false
      return true
    })

    function close() {
      basicDialog.value?.close()
    }

    async function print(product) {
      addTextField({
        data: product.name,
        positionY: 30,
        align: 2,
      });
      addQrCode({
        data: `/products?product=${product.id}`,
        positionY: 80,
        size: 5,
        align: 2
      })
      addTextField({
        data: `Цена: ${formatPrice(product.newPrice)}`,
        positionY: 270,
        align: 2,
      });
      addPrintQuantity(1);
      const tsplMarkup = buildTsplMarkup();
      await bluetoothWrite(tsplMarkup);
    }

    async function submit() {
      try {
        loading.value = true;
        for (const product of bulkStore.getBulkProducts) {
          await print(product);
        }
        showSuccess('Ценники распечатаны!')
        emit('on-finish')
      } catch (error) {
        showError('Произошла ошибка, попробуйте позже...')
        emit('on-error')
      } finally {
        close()
        loading.value = false;
      }
    }

    return {
      submit,
      basicDialog,
      loading,
      close,
      bluetoothConnected,
      notConfigured
    }
  }
})
</script>
