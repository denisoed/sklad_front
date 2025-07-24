<template>
  <q-dialog
    :model-value="opened"
    position="bottom"
    @update:model-value="close"
  >
    <q-card style="width: 350px">
      <q-card-section v-if="isLoading" class="qr-modal-loader flex flex-center">
        <q-spinner size="50px" color="primary" />
      </q-card-section>
      <q-card-section v-show="!isLoading" class="flex no-wrap column row items-center no-wrap">
        <StreamBarcodeReader
          @decode="onDecode"
          @result="onResult"
          @loaded="onLoaded"
          class="full-width q-mb-md q-mr-auto"
        />
      </q-card-section>
      <q-card-section class="q-pb-xl q-pt-none">
        <q-btn
          style="width:100%;height:40px;"
          color="grey"
          icon="mdi-close"
          push
          @click="close"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import {
  defineComponent,
  ref,
  watch,
  toRefs
} from 'vue'
import { useRouter } from 'vue-router'
import { StreamBarcodeReader } from 'vue-barcode-reader'
import { useLazyQuery } from '@vue/apollo-composable'
import {
  GET_PRODUCT,
} from 'src/graphql/types'
import useHelpers from 'src/modules/useHelpers'

export default defineComponent({
  name: 'QRModal',
  components: {
    StreamBarcodeReader,
  },
  props: {
    opened: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const {
      load: getEditProduct,
      result: editProduct,
    } = useLazyQuery(GET_PRODUCT)
    const { showError } = useHelpers()

    const { opened } = toRefs(props)

    const decodedLink = ref(null)
    const isLoading = ref(true)

    const { push } = useRouter()

    function close() {
      emit('close')
    }

    function onDecode(link) {
      decodedLink.value = link
      const [, queryString] = link.split('?');
      const searchParams = new URLSearchParams(queryString);
      if (searchParams.get('product')) {
        getEditProduct(
          null,
          { id: searchParams.get('product') },
          { fetchPolicy: 'network-only' }
        )
      }
    }

    function onResult() {}

    function onLoaded() {}

    watch(opened, (val) => {
      if (val) {
        setTimeout(() => {
          isLoading.value = false
        }, 1000);
      } else {
        isLoading.value = true
      }
    })

    watch(editProduct, (val) => {
      if (val?.product) {
        push(decodedLink.value)
      } else {
        showError('Товар не найден')
        close()
      }
    })

    return {
      close,
      onDecode,
      onLoaded,
      onResult,
      isLoading
    }
  }
})
</script>

<style lang="scss" scoped>
.qr-modal-loader {
  width: 100%;
  height: 300px;
}
</style>