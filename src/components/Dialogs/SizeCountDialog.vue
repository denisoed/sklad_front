<template>
  <q-dialog
    :model-value="modelValue"
    position="bottom"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <SwipeToClose
      direction="down"
      @on-close="close"
    >
      <q-card>
        <div class="dialog-close" id="dialog-close">
          <div class="dialog-close-line" />
        </div>
        <q-card-section class="flex no-wrap column row q-gap-md items-center no-wrap q-pb-xl">
          <InputPlusMinusVue
            class="full-width"
            :max="100"
            :model-value="selectedSize.count"
            :label="`Количество единиц для размера <b>${selectedSize.size}</b>`"
            @update:model-value="selectedCounts = $event"
          />
          <q-separator class="full-width" />
          <div class="flex justify-between full-width no-wrap q-gap-md">
            <q-btn
              color="grey"
              icon="mdi-close"
              push
              class="button-size"
              @click="close"
            />
            <q-btn
              class="button-size"
              color="primary"
              icon="mdi-check"
              push
              @click="submit"
            />
          </div>
        </q-card-section>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import InputPlusMinusVue from 'src/components/InputPlusMinus'
import SwipeToClose from 'src/components/SwipeToClose.vue'
import { ref, toRefs } from 'vue'

const emit = defineEmits(['update:modelValue', 'submit'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedSize: {
    type: Object,
    default: () => ({})
  }
})

const { selectedSize } = toRefs(props)
const selectedCounts = ref(0)

function close() {
  emit('update:modelValue', false)
}

function submit() {
  emit('submit', selectedCounts.value)
  selectedCounts.value = 0
  close()
}
</script>
