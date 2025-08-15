<template>
  <q-dialog
    :model-value="modelValue"
    position="bottom"
    class="q-pa-md"
    @update:model-value="$emit('update:modelValue', $event)"
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
          
          <!-- Size filter -->
          <div v-if="availableSizes.length" class="full-width">
            <p class="full-width text-left text-bold q-mb-sm text-subtitle1">
              {{ $t('sizes.title') }}
            </p>
            <div v-if="loadingAvailableSizes" class="text-center q-py-md">
              <q-spinner size="20px" />
              <span class="q-ml-sm">{{ $t('sizes.loading') }}</span>
            </div>
            <div v-else-if="availableSizes.length" class="sizes-grid">
              <q-btn
                v-for="size in availableSizes"
                :key="size"
                :class="['size-btn']"
                :outline="!localFilters.sizes.includes(size)"
                color="primary"
                :text-color="localFilters.sizes.includes(size) ? 'black' : 'white'"
                size="md"
                push
                :label="size"
                @click="toggleSize(size)"
              />
            </div>
            <div v-else class="text-grey-6 text-center q-py-md">
              {{ $t('sizes.notFound') }}
            </div>
            <q-separator class="full-width q-my-md" />
          </div>
          
          <!-- Price range -->
          <div class="full-width q-mb-md">
            <p class="full-width text-left text-bold q-mb-sm text-subtitle1">
              {{ $t('filter.priceRange') }}
            </p>
            <div class="flex q-gap-sm no-wrap">
              <InputPrice
                v-model="localFilters.priceFrom"
                outlined
                dense
                :label="$t('filter.from')"
              />
              <InputPrice
                v-model="localFilters.priceTo"
                outlined
                dense
                :label="$t('filter.to')"
              />
            </div>
          </div>
          
          <q-separator class="full-width q-mb-md" />
          
          <!-- Color filter -->
          <div class="flex items-center no-wrap column full-width q-gap-sm q-mb-md">
            <p class="full-width text-left text-bold q-mb-none text-subtitle1">
              {{ $t('filter.colorFilter') }}
            </p>
            <ColorPicker
              ref="colorPickerRef"
              :selected="localFilters.color"
              :selected-colors="localFilters.colors || []"
              :multiselect="true"
              @on-change="setColorName"
            />
          </div>
          
          <q-separator class="full-width q-mb-md" />
          
          <!-- Product status filter -->
          <div class="full-width q-mb-md">
            <p class="full-width text-left text-bold q-mb-sm text-subtitle1">
              {{ $t('filter.productStatus') }}
            </p>
            <div class="flex column q-gap-sm">
              <q-checkbox
                v-model="localFilters.withDiscount"
                :label="$t('filter.withDiscount')"
                color="primary"
              />
            </div>
          </div>
          
          <q-separator class="full-width q-mb-md" />
          
          <!-- Controls -->
          <div class="flex justify-between no-wrap q-gap-md full-width">
            <q-btn
              style="height:40px;"
              color="deep-orange"
              icon="mdi-refresh"
              push
              @click="clear"
            />
            <q-btn
              class="button-size q-mr-auto"
              color="grey"
              icon="mdi-close"
              push
              @click="$emit('update:modelValue', false)"
            />
            <q-btn
              class="button-size"
              color="primary"
              icon="mdi-magnify"
              push
              @click="apply"
            />
          </div>
        </q-card-section>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import ColorPicker from 'src/components/ColorPicker.vue'
import SwipeToClose from 'src/components/SwipeToClose.vue'
import useSizes from 'src/modules/useSizes'
import useSklads from 'src/modules/useSklads'
import { useI18n } from 'vue-i18n'
import InputPrice from 'src/components/InputPrice.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'apply', 'clear'])

const { t: $t } = useI18n()
const colorPickerRef = ref(null)
const availableSizes = ref([])
const loadingAvailableSizes = ref(false)
const { sizes, fetchSizes } = useSizes()
const { sklads } = useSklads()

const localFilters = reactive({ 
  ...props.filters,
  colors: props.filters.colors || []
})

watch(() => props.filters, (newFilters) => {
  Object.assign(localFilters, newFilters)
  if (!localFilters.colors) {
    localFilters.colors = []
  }
}, { deep: true })

async function fetchAvailableSizes() {
  try {
    loadingAvailableSizes.value = true
    await fetchSizes(sklads.value.map(s => s.id))
    const sizesSet = new Set()
    sizes.value?.forEach(sizeGroup => {
      sizeGroup.list?.forEach(sizeItem => {
        if (sizeItem.size) {
          sizesSet.add(sizeItem.size)
        }
      })
    })
    availableSizes.value = Array.from(sizesSet).sort((a, b) => {
      const aIsNumber = !isNaN(a)
      const bIsNumber = !isNaN(b)
      if (aIsNumber && bIsNumber) return Number(a) - Number(b)
      if (aIsNumber) return -1
      if (bIsNumber) return 1
      return a.localeCompare(b)
    })
  } catch (error) {
    console.error($t('filter.sizesLoadingError'), error)
    availableSizes.value = []
  } finally {
    loadingAvailableSizes.value = false
  }
}

function toggleSize(size) {
  const index = localFilters.sizes.indexOf(size)
  if (index === -1) {
    localFilters.sizes.push(size)
  } else {
    localFilters.sizes.splice(index, 1)
  }
}

function setColorName(colors) {
  if (Array.isArray(colors)) {
    localFilters.colors = colors
    localFilters.color = colors.length > 0 ? colors[0].color : null
    localFilters.colorName = colors.length > 0 ? colors[0].name : null
  } else {
    localFilters.color = colors?.color
    localFilters.colorName = colors?.name
    localFilters.colors = colors ? [colors] : []
  }
}

function apply() {
  emit('apply', localFilters)
  emit('update:modelValue', false)
}

function clear() {
  colorPickerRef.value?.clear()
  localFilters.sizes = []
  localFilters.priceFrom = null
  localFilters.priceTo = null
  localFilters.color = null
  localFilters.colorName = null
  localFilters.colors = []
  localFilters.withDiscount = false
  emit('clear')
  emit('update:modelValue', false)
}

onMounted(fetchAvailableSizes)
</script>

<style lang="scss" scoped>
.sizes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.size-btn {
  min-width: fit-content;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
</style>
