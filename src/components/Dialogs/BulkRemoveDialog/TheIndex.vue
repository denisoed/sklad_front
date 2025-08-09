<template>
  <q-dialog
    :model-value="modelValue"
    position="bottom"
    class="q-pa-md"
    @update:model-value="$emit('update:modelValue', $event)"
    @hide="onHide"
  >
    <SwipeToClose
      direction="down"
      @on-close="$emit('update:modelValue', false)"
    >
      <q-card style="max-height: 80vh;" class="scroll">
        <div class="dialog-close" id="dialog-close">
          <div class="dialog-close-line" />
        </div>
        <q-card-section class="flex items-center no-wrap column row items-center no-wrap q-pb-xl">
          <div class="relative full-width">
            <div class="text-h6 q-mb-sm">{{ title }}</div>
            <BulkPreview
              v-show="step === 1"
              @on-next="next"
              @on-remove="remove"
            />
            <StepTwo
              v-show="step === 2"
              :loading="loading"
              @on-prev="prev"
              @on-submit="submit"
            />
          </div>
        </q-card-section>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BulkPreview from 'src/components/Dialogs/Bulk/Preview.vue';
import StepTwo from 'src/components/Dialogs/BulkRemoveDialog/StepTwo.vue';
import SwipeToClose from 'src/components/SwipeToClose.vue';
import useHelpers from 'src/modules/useHelpers'
import useProduct from 'src/modules/useProduct'
import { useBulkStore } from 'src/stores/bulk'

defineOptions({
  name: 'BulkRemoveDialog',
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['on-finish'])

const { t: $t } = useI18n()
const { updateProducts, removeProducts } = useBulkStore()
const { showSuccess, showError } = useHelpers()

const step = ref(1)
const isLoading = ref(false)

const title = computed(() => step.value === 1 ? $t('bulk.selectedProducts') : $t('bulk.deletion'))

function remove() {}

function prev() {
  step.value = 1;
}

function next() {
  step.value = 2;
}

function onHide() {
  step.value = 1;
  emit('update:modelValue', false)
}

async function submit() {
  try {
    loading.value = true;
    for (const p of bulkStore.getBulkProducts) {
      await removeProduct(p.id, p)
    }
    showSuccess($t('bulk.productsDeleted'))
    emit('on-finish')
  } catch (error) {
    showError($t('common.error') + ', ' + $t('common.tryLater'))
  } finally {
    onHide()
    loading.value = false;
  }
}
</script> 