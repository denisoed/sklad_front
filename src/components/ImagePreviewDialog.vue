<template>
  <q-dialog
    :model-value="modelValue"
    position="bottom"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <SwipeToClose
      direction="down"
      @on-close="close"
    >
      <q-card class="full-width">
        <div class="dialog-close" id="dialog-close">
          <div class="dialog-close-line" />
        </div>
        <q-img
          :src="imageSrc"
          spinner-size="md"
          spinner-color="grey"
        />
        <q-btn
          round
          push
          color="deep-orange"
          size="sm"
          @click="close"
          class="absolute-top-right q-mr-md q-mt-md"
        >
          <q-icon
            name="mdi-close"
            color="white"
          />
        </q-btn>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import SwipeToClose from 'src/components/SwipeToClose.vue'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  imageSrc: {
    type: String,
    required: true
  }
})

function close() {
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.dialog-close {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  width: 40px;
  height: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  .dialog-close-line {
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 2px;
  }
}
</style> 