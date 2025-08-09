<template>
  <q-dialog
    :model-value="opened"
    position="bottom"
    @update:model-value="close"
  >
    <q-swipe-to-close
      @update:model-value="close"
      direction="down"
      style="width: 350px"
    >
      <q-card class="full-width">
        <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
          <p class="full-width text-left text-bold q-mb-none text-subtitle1">
            Ценник
          </p>
          <div>Пример ценника</div>
          <div class="flex justify-center full-width q-mt-md">
            <q-btn
              style="width: 100px;"
              color="primary"
              icon="mdi-check"
              push
              class="q-mr-md"
              @click="print"
            />
            <q-btn
              color="grey"
              icon="mdi-close"
              push
              @click="close"
            />
          </div>
        </q-card-section>
        <q-inner-loading :showing="false">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
    </q-swipe-to-close>
  </q-dialog>
</template>

<script>
import {
  defineComponent,
} from 'vue'
import useHelpers from 'src/modules/useHelpers'

export default defineComponent({
  name: 'PrintModal',
  props: {
    opened: {
      type: Boolean,
      default: false
    },
  },
  emits: ['close', 'print'],
  setup(props, { emit }) {

    const { showSuccess, showError } = useHelpers()

    function close() {
      emit('close')
    }

    async function print() {
      try {
        // Print
      } catch (error) {
        showError($t('common.unknownError') + '. ' + $t('common.serverError'))
      } finally {
        close()
        emit('finished')
      }
    }

    return {
      close,
      print,
    }
  }
})
</script>
