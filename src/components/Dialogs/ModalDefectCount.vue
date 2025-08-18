<template>
  <q-dialog
    :model-value="modelValue"
    position="bottom"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <SwipeToClose direction="down" @on-close="close">
      <q-card>
        <div class="dialog-close" id="dialog-close">
          <div class="dialog-close-line" />
        </div>
        <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
          <p class="full-width text-left text-bold q-mb-none text-subtitle1">
            {{ title || $t('defect.dialogCountTitle') }}
          </p>
          <q-separator class="full-width q-mt-sm q-mb-md" />
          <div class="full-width flex column q-gap-sm">
            <q-input
              v-model="desc"
              type="textarea"
              :label="$t('common.description')"
              autogrow
              outlined
            />
          </div>
          <div class="full-width full-height flex column q-mt-md">
            <InputPlusMinus
              v-model="selectedCount"
              :max="max"
              :min="1"
              :label="$t('common.quantity')"
              class="q-my-auto"
            />
            <q-separator class="full-width q-my-md" />
            <div class="flex justify-between full-width no-wrap q-gap-md">
              <q-btn
                class="button-size"
                color="grey"
                icon="mdi-close"
                push
                @click="close"
              />
              <q-btn
                class="button-size"
                color="primary"
                icon="mdi-check"
                push
                @click="submit"
                :disable="!selectedCount || !desc"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import InputPlusMinus from 'src/components/InputPlusMinus'
import SwipeToClose from 'src/components/SwipeToClose.vue'
import { ref, watch, toRefs } from 'vue'

const emit = defineEmits(['submit'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: null
  },
  selected: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    default: null
  },
  description: {
    type: String,
    default: ''
  }
})

const { selected, description } = toRefs(props)
const selectedCount = ref(selected.value)
const desc = ref(description.value)

function close() {
  emit('update:modelValue', false)
}

function submit() {
  emit('submit', {
    countSizes: selectedCount.value,
    description: desc.value
  })
  close()
}

watch(() => props.modelValue, (val) => {
  if (val) {
    selectedCount.value = selected.value
    desc.value = description.value
  }
})
</script>

<style lang="scss" scoped>
</style>
