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
        </div>
        <q-img
          :src="imageSrc"
          spinner-size="md"
          spinner-color="grey"
        />
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
  background-color: transparent;
  position: absolute;
  top: 0;
  left: 0;
}
</style> 