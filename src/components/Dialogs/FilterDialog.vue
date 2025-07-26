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
        <q-card-section class="flex items-center no-wrap column row items-center no-wrap q-pb-xl q-pt-none">
          
          <!-- Фильтр по размерам -->
          <div v-if="availableSizes.length" class="full-width">
            <p class="full-width text-left text-bold q-mb-sm text-subtitle1">
              Размеры
            </p>
            <div v-if="loadingAvailableSizes" class="text-center q-py-md">
              <q-spinner size="20px" />
              <span class="q-ml-sm">Загрузка размеров...</span>
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
                :label="size"
                dense
                @click="toggleSize(size)"
              />
            </div>
            <div v-else class="text-grey-6 text-center q-py-md">
              Размеры не найдены
            </div>
            <q-separator class="full-width q-my-md" />
          </div>
          
          <!-- Ценовой диапазон -->
          <div class="full-width q-mb-md">
            <p class="full-width text-left text-bold q-mb-sm text-subtitle1">
              Ценовой диапазон (розничная цена)
            </p>
            <div class="flex q-gap-sm">
              <q-input
                v-model.number="localFilters.priceFrom"
                type="number"
                outlined
                dense
                label="От"
                suffix="сом"
                style="flex: 1"
                clearable
              />
              <q-input
                v-model.number="localFilters.priceTo"
                type="number"
                outlined
                dense
                label="До"
                suffix="сом"
                style="flex: 1"
                clearable
              />
            </div>
          </div>
          
          <q-separator class="full-width q-mb-md" />
          
          <!-- Цветовой фильтр -->
          <div class="flex items-center no-wrap column full-width q-gap-sm q-mb-md">
            <p class="full-width text-left text-bold q-mb-none text-subtitle1">
              Фильтр по цвету
            </p>
            <ColorPicker
              ref="colorPickerRef"
              :selected="localFilters.color"
              @on-change="setColorName"
            />
          </div>
          
          <q-separator class="full-width q-mb-md" />
          
          <!-- Фильтры по состоянию товара -->
          <div class="full-width q-mb-md">
            <p class="full-width text-left text-bold q-mb-sm text-subtitle1">
              Состояние товара
            </p>
            <div class="flex column q-gap-sm">
              <q-checkbox
                v-model="localFilters.withDiscount"
                label="Со скидкой"
                dense
              />
            </div>
          </div>
          
          <q-separator class="full-width q-mb-md" />
          
          <!-- Управление -->
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

<script>
import { defineComponent, ref, reactive, onMounted, watch } from 'vue'
import ColorPicker from 'src/components/ColorPicker.vue'
import SwipeToClose from 'src/components/SwipeToClose.vue'
import useSizes from 'src/modules/useSizes'

export default defineComponent({
  name: 'FilterDialog',
  components: {
    ColorPicker,
    SwipeToClose
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    filters: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue', 'apply', 'clear'],
  setup(props, { emit }) {
    const colorPickerRef = ref(null)
    const availableSizes = ref([])
    const loadingAvailableSizes = ref(false)
    const { sizes, fetchSizes } = useSizes()

    const localFilters = reactive({ ...props.filters })

    watch(() => props.filters, (newFilters) => {
      Object.assign(localFilters, newFilters)
    }, { deep: true })

    async function fetchAvailableSizes() {
      try {
        loadingAvailableSizes.value = true
        await fetchSizes()
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
        console.error('Ошибка загрузки размеров:', error)
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

    function setColorName(color) {
      localFilters.color = color?.color
      localFilters.colorName = color?.name
    }

    function apply() {
      emit('apply', localFilters)
      emit('update:modelValue', false)
    }

    function clear() {
      colorPickerRef.value?.clear()
      emit('clear')
      emit('update:modelValue', false)
    }

    onMounted(fetchAvailableSizes)

    return {
      localFilters,
      colorPickerRef,
      availableSizes,
      loadingAvailableSizes,
      toggleSize,
      apply,
      clear,
      setColorName
    }
  }
})
</script>

<style lang="scss" scoped>
.sizes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 8px;
  width: 100%;
}

.size-btn {
  min-height: 35px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}
</style>
