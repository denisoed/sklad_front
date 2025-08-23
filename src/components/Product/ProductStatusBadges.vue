<template>
  <div>
    <div
      v-if="isDuplicating"
      class="flex items-center border-radius-sm q-pa-sm q-mb-md q-px-md"
      style="background-color: rgb(0 255 0 / 8%);"
    >
      <span>{{ $t('product.duplicatingProduct', { id: duplicatedFromID }) }}</span>
      <q-icon name="mdi-content-duplicate" class="q-ml-auto" color="green-5" size="sm" />
    </div>
    <div
      v-if="isDraft && !editProduct?.product?.id && !isDuplicating"
      class="flex items-center q-pa-sm q-mb-md q-px-md border-radius-sm"
      style="background-color: rgb(255 255 0 / 8%);"
    >
      <span class="q-mr-sm">{{ $t('product.draft') }}</span>
      <div class="flex items-center q-gap-sm q-ml-auto">
        <q-btn
          v-if="isDraft && !editProduct?.product?.id && !isDuplicating"
          class="q-ml-auto"
          text-color="negative"
          @click="clearDraft"
          icon="mdi-trash-can-outline"
          size="sm"
          round
        />
      </div>
    </div>
    <div
      v-if="product.withDiscount"
      class="flex items-center q-pa-sm q-mb-md q-px-md border-radius-sm"
      style="background-color: rgb(255 0 0 / 8%);"
    >
      <span class="q-mr-sm">{{ $t('product.hasPromotion') }}</span>
      <q-icon class="mdi mdi-ticket-percent q-ml-auto" color="red-5" size="sm" />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const { t: $t } = useI18n()
const $q = useQuasar()

const emit = defineEmits(['clearDraft'])

const props = defineProps({
  isDuplicating: Boolean,
  duplicatedFromID: [String, Number],
  isDraft: Boolean,
  editProduct: Object,
  product: {
    type: Object,
    required: true
  }
})

function clearDraft() {
  $q.dialog({
    title: $t('product.clearDraft'),
    message: $t('product.clearDraftDescription'),
    cancel: true,
    persistent: true,
    ok: {
      color: 'deep-orange',
      label: $t('common.clear'),
      push: true
    },
    cancel: {
      color: 'grey',
      textColor: 'white', 
      label: $t('common.cancel'),
      push: true
    }
  }).onOk(() => {
    emit('clearDraft')
  })
}
</script>
