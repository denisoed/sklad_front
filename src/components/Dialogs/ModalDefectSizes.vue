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
            {{ title || $t('defect.dialogSizesTitle') }}
          </p>
          <q-separator class="full-width q-mt-sm q-mb-md" />
          <transition name="slide-fade" mode="out-in">
            <!-- Step 1 -->
            <div v-if="!isStepTwo" class="full-width">
              <div class="full-width flex column q-gap-sm q-mb-md">
                <q-input
                  v-model="desc"
                  type="textarea"
                  :label="$t('common.description')"
                  autogrow
                  outlined
                />
              </div>
              <div class="full-width flex column">
                <p class="q-mb-sm">{{ $t('common.sizes') }}</p>
                <div class="btn-sizes_list">
                  <q-btn
                    v-for="(s, i) of listSizes"
                    :key="i"
                    :color="!selectedSizes.some(sz => sz.size === s.size) ? 'white' : 'primary'"
                    text-color="white"
                    :outline="!selectedSizes.some(sz => sz.size === s.size)"
                    push
                    class="btn-sizes-btn border-radius-sm"
                    :disable="!s.has"
                    @click="toggleSize(s)"
                  >
                    <span>{{ s.size }}
                      <sup v-if="s.count > 1">{{ s.count > 1 ? `(${s.count} ${$t('common.pieces')})` : '' }}</sup>
                    </span>
                    <q-badge
                      v-if="s.countSelected"
                      color="red"
                      floating
                    >
                      {{ s.countSelected }}
                    </q-badge>
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
            </div>
            <!-- Step 2 -->
            <div v-else class="full-width full-height flex column">
              <InputPlusMinus
                :max="selectedSize.count"
                :model-value="selectedCounts"
                :label="`${$t('common.quantityForSize')}: <b>${selectedSize.size}</b>`"
                class="q-my-auto"
                @update:model-value="onChangeCount"
              />
              <q-separator class="full-width q-my-md" />
              <div class="flex no-wrap q-gap-md">
                <q-btn
                  class="button-size"
                  color="grey"
                  icon="mdi-arrow-left"
                  push
                  @click="isStepTwo = false"
                />
                <q-btn
                  class="button-size"
                  color="primary"
                  icon="mdi-check"
                  push
                  @click="setSizeWithCounts"
                />
              </div>
            </div>
          </transition>
        </q-card-section>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import SwipeToClose from 'src/components/SwipeToClose.vue'
import { ref, watch, toRefs, computed } from 'vue'
import InputPlusMinus from 'src/components/InputPlusMinus'

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

const isStepTwo = ref(false)
const selectedSize = ref(null)
const selectedCounts = ref(null)

function removeItemOnce(arr, value) {
  const index = arr.map(s => s.size).indexOf(value.size)
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

function toggleSize(size) {
  if (size.count > 1) {
    selectedSize.value = size
    selectedCounts.value = getCountSize(size.size, selectedSizes.value)
    isStepTwo.value = true
    return
  }
  const exists = selectedSizes.value.some(s => s.size === size.size)
  if (exists) {
    selectedSizes.value = removeItemOnce(selectedSizes.value, size)
  } else {
    selectedSizes.value.push(size)
  }
}

function getCountSize(size, sizesArr) {
  let count = 0
  sizesArr.forEach(s => {
    if (s.size === size) {
      count += 1
    }
  })
  return count
}

const listSizes = computed(() => {
  const uniqueSizes = [...new Set(sizes.value.map(s => s.size))]
  return uniqueSizes.map(size => {
    const count = getCountSize(size, sizes.value)
    return {
      size,
      countSelected: getCountSize(size, selectedSizes.value),
      count,
      has: sizes.value.some(s => s.size === size)
    }
  })
})

function onChangeCount(count) {
  selectedCounts.value = count
}

function setSizeWithCounts() {
  isStepTwo.value = false
  selectedSizes.value = selectedSizes.value.filter(s => s.size !== selectedSize.value.size)
  for (let i = 0; i < selectedCounts.value; i++) {
    selectedSizes.value.push(selectedSize.value)
  }
  selectedSize.value = null
  selectedCounts.value = null
}

function close() {
  emit('update:modelValue', false)
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
