<template>
  <q-dialog :model-value="modelValue" position="bottom" @update:model-value="$emit('update:modelValue', $event)">
    <SwipeToClose direction="down" @on-close="close">
      <q-card>
        <div class="dialog-close" id="dialog-close">
          <div class="dialog-close-line" />
        </div>
        <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
          <h6 class="full-width text-left text-bold q-my-none text-subtitle1">
            {{ $t('bundle.selectSizeQuantity') }}
          </h6>
          <p class="full-width text-left q-mb-none text-subtitle2 text-grey-5">
            {{ $t('bundle.selectSizeQuantityDescription', { size: size?.size, max: maxCount }) }}
          </p>
          <q-separator class="full-width q-mt-sm q-mb-md" />
          
          <div class="full-width q-mb-md">
            <InputPlusMinus
              :max="maxCount"
              :min="0"
              :model-value="selectedCount"
              :label="$t('common.quantity')"
              @update:model-value="onChangeCount"
            />
          </div>
          
          <q-separator class="full-width q-my-md" />
          <div class="flex justify-between full-width no-wrap q-gap-md">
            <q-btn class="button-size" color="grey" icon="mdi-close" push @click="close" />
            <q-btn 
              class="button-size" 
              color="primary" 
              icon="mdi-check" 
              push 
              @click="submit"
              :disable="selectedCount === 0"
            />
          </div>
        </q-card-section>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import SwipeToClose from 'src/components/SwipeToClose.vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import InputPlusMinus from 'src/components/InputPlusMinus.vue'

const emit = defineEmits(['submit', 'update:modelValue'])
const { t: $t } = useI18n()

const props = defineProps({
  modelValue: Boolean,
  size: {
    type: Object,
    default: null
  },
  maxCount: {
    type: Number,
    default: 0
  }
})

const selectedCount = ref(0)

watch(() => props.modelValue, (val) => {
  if (val) {
    selectedCount.value = 0
  }
})

function onChangeCount(count) {
  selectedCount.value = count
}

function close() {
  selectedCount.value = 0
  emit('update:modelValue', false)
}

function submit() {
  emit('submit', selectedCount.value)
}
</script>

<style lang="scss" scoped>
.button-size {
  min-width: 120px;
}
</style>
