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
            {{ title || $t('defect.addDefectTitle') }}
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
          <div class="full-width flex column q-mb-md q-gap-sm">
            <p class="q-mb-sm">{{ $t('common.sizes') }}</p>
            <div class="btn-sizes_list">
              <q-btn
                v-for="(s, i) of sizes"
                :key="i"
                :color="!selectedSizes.some(sz => sz.size === s.size) ? 'white' : 'primary'"
                text-color="white"
                :outline="!selectedSizes.some(sz => sz.size === s.size)"
                push
                class="btn-sizes-btn border-radius-sm"
                @click="toggleSize(s)"
              >
                <span>{{ s.size }}</span>
              </q-btn>
            </div>
          </div>
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
              :disable="!selectedSizes.length || !desc"
            />
          </div>
        </q-card-section>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
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
  sizes: {
    type: Array,
    default: () => []
  },
  selected: {
    type: Array,
    default: () => []
  },
  description: {
    type: String,
    default: ''
  }
})

const { selected, sizes, description } = toRefs(props)
const selectedSizes = ref([...selected.value])
const desc = ref(description.value)

function close() {
  emit('update:modelValue', false)
}

function toggleSize(size) {
  const idx = selectedSizes.value.findIndex(s => s.size === size.size)
  if (idx > -1) {
    selectedSizes.value.splice(idx, 1)
  } else {
    selectedSizes.value.push(size)
  }
}

function submit() {
  emit('submit', {
    sizes: selectedSizes.value,
    description: desc.value
  })
  close()
}

watch(() => props.modelValue, (val) => {
  if (val) {
    selectedSizes.value = [...selected.value]
    desc.value = description.value
  }
})
</script>

<style lang="scss" scoped>
.btn-sizes_list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.btn-sizes-btn {
  min-width: 0;
  flex: 0 1 auto;
}
</style>
