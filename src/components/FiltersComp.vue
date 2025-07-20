<template>
  <div class="filters flex no-wrap flex-center q-mb-lg">
    <BtnBack
      class="q-mr-md"
    />
    
    <!-- Основное поле поиска -->
    <q-input
      v-model="selectedFilters.name_contains"
      outlined
      debounce="800"
      label="Поиск по имени товара"
      class="full-width block-bg"
      dense
      :autofocus="autofocus"
      clearable
      @update:model-value="search"
    >
      <template v-if="!selectedFilters.name_contains" #prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    
    <q-btn
      class="q-ml-md"
      push
      clearable
      round
      size="md"
      color="white"
      text-color="black"
      @click="toggleLeftDrawer"
      v-vibrate
    >
      <q-icon
        name="mdi-filter-variant"
      />
      <div v-if="hasFilters" class="alert_dot" />
    </q-btn>

    <!-- Расширенные фильтры -->
    <q-dialog
      v-model="leftDrawerOpen"
      position="bottom"
      class="q-pa-md"
    >
    <SwipeToClose
      direction="down"
      @on-close="leftDrawerOpen = false"
    >
      <q-card style="max-height: 80vh;" class="scroll">
        <div class="dialog-close" id="dialog-close">
          <div class="dialog-close-line" />
        </div>
        <q-card-section class="flex items-center no-wrap column row items-center no-wrap q-pb-xl q-pt-none">
          
          <!-- Фильтр по размерам (перемещен в начало) -->
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
                :class="[
                  'size-btn'
                ]"
                :outline="!selectedFilters.sizes.includes(size)"
                color="primary"
                :text-color="selectedFilters.sizes.includes(size) ? 'black' : 'white'"
                size="md"
                dense
                @click="toggleSize(size)"
                v-vibrate
              >
                {{ size }}
              </q-btn>
            </div>
            <div v-else class="text-grey-6 text-center q-py-md">
              Размеры не найдены
            </div>
            <q-separator class="full-width q-my-md" />
          </div>

          <!-- Сортировка -->
          <div class="full-width q-mb-md">
            <p class="full-width text-left text-bold q-mb-sm text-subtitle1">
              Сортировка
            </p>
            <q-select
              v-model="selectedFilters.sortBy"
              :options="sortOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              dense
              label="Выберите сортировку"
            />
          </div>
          
          <q-separator class="full-width q-mb-md" />
          
          <!-- Ценовой диапазон -->
          <div class="full-width q-mb-md">
            <p class="full-width text-left text-bold q-mb-sm text-subtitle1">
              Ценовой диапазон (розничная цена)
            </p>
            <div class="flex q-gap-sm">
              <q-input
                v-model.number="selectedFilters.priceFrom"
                type="number"
                outlined
                dense
                label="От"
                suffix="сом"
                style="flex: 1"
              />
              <q-input
                v-model.number="selectedFilters.priceTo"
                type="number"
                outlined
                dense
                label="До"
                suffix="сом"
                style="flex: 1"
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
              :selected="selectedFilters.color"
              @on-change="selectedFilters.color = $event"
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
                v-model="selectedFilters.hasImage"
                label="Только с изображением"
                dense
              />
              <q-checkbox
                v-model="selectedFilters.noImage"
                label="Без изображения"
                dense
              />
              <q-checkbox
                v-model="selectedFilters.lowStock"
                label="Заканчивается (≤ 5 шт.)"
                dense
              />
              <q-checkbox
                v-model="selectedFilters.inStock"
                label="В наличии"
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
              v-vibrate
            />
            <q-btn
              class="button-size q-mr-auto"
              color="grey"
              icon="mdi-close"
              push
              @click="leftDrawerOpen = false"
              v-vibrate
            />
            <q-btn
              class="button-size"
              color="primary"
              icon="mdi-magnify"
              push
              @click="applyFilters"
              v-vibrate
            />
          </div>
        </q-card-section>
      </q-card>
    </SwipeToClose>
    </q-dialog>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  ref,
  reactive,
  onMounted,
} from 'vue'
import ColorPicker from 'src/components/ColorPicker.vue'
import BtnBack from 'src/components/BtnBack.vue'
import SwipeToClose from 'src/components/SwipeToClose.vue'
import useSizes from 'src/modules/useSizes'

export default defineComponent({
  name: 'FiltersComp',
  components: {
    ColorPicker,
    BtnBack,
    SwipeToClose
  },
  props: {
    autofocus: {
      type: Boolean,
      default: false
    }
  },
  emits: ['on-search'],
  setup(props, { emit }) {
    const leftDrawerOpen = ref(false)
    const colorPickerRef = ref(null)
    const scrolledTop = ref(0)
    const availableSizes = ref([])
    const loadingAvailableSizes = ref(false)
    
    // Используем модуль useSizes
    const { sizes, fetchSizes } = useSizes()
    
    const selectedFilters = reactive({
      color: null,
      name_contains: null,
      withDiscount: false,
      priceFrom: null,
      priceTo: null,
      hasImage: false,
      noImage: false,
      lowStock: false,
      inStock: false,
      sortBy: null,
      sizes: []
    })
    
    const sortOptions = [
      { label: 'По умолчанию', value: null },
      { label: 'По названию (А-Я)', value: 'name:asc' },
      { label: 'По названию (Я-А)', value: 'name:desc' },
      { label: 'По цене (возрастание)', value: 'newPrice:asc' },
      { label: 'По цене (убывание)', value: 'newPrice:desc' },
      { label: 'По количеству (возрастание)', value: 'countSizes:asc' },
      { label: 'По количеству (убывание)', value: 'countSizes:desc' }
    ]
    
    const hasFilters = computed(() => {
      return Object.keys(selectedFilters).some(key => {
        const value = selectedFilters[key]
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'boolean') return value
        return value !== null && value !== undefined && value !== ''
      })
    })

    // Получение всех доступных размеров
    async function fetchAvailableSizes() {
      try {
        loadingAvailableSizes.value = true
        
        // Загружаем размеры через правильный модуль
        await fetchSizes()
        
        const sizesSet = new Set()
        
        // Извлекаем размеры из загруженных данных
        sizes.value?.forEach(sizeGroup => {
          sizeGroup.list?.forEach(sizeItem => {
            if (sizeItem.size) {
              sizesSet.add(sizeItem.size)
            }
          })
        })
        
        // Сортируем размеры (числовые в начале, затем буквенные)
        availableSizes.value = Array.from(sizesSet).sort((a, b) => {
          const aIsNumber = !isNaN(a)
          const bIsNumber = !isNaN(b)
          
          if (aIsNumber && bIsNumber) {
            return Number(a) - Number(b)
          } else if (aIsNumber && !bIsNumber) {
            return -1
          } else if (!aIsNumber && bIsNumber) {
            return 1
          } else {
            return a.localeCompare(b)
          }
        })
        
      } catch (error) {
        console.error('Ошибка загрузки размеров:', error)
        availableSizes.value = []
      } finally {
        loadingAvailableSizes.value = false
      }
    }

    function toggleSize(size) {
      const index = selectedFilters.sizes.indexOf(size)
      if (index === -1) {
        selectedFilters.sizes.push(size)
      } else {
        selectedFilters.sizes.splice(index, 1)
      }
    }
    
    function removeSize(sizeToRemove) {
      selectedFilters.sizes = selectedFilters.sizes.filter(size => size !== sizeToRemove)
    }

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value
      if (window.innerWidth < 1024) {
        const sTop = window.scrollY
        scrolledTop.value = 50 - (sTop >= 50 ? 50 : sTop - 10)
      }
    }

    function search() {
      // Создаем объект фильтров для отправки
      const filters = {}
      
      // Основной поиск
      if (selectedFilters.name_contains) {
        filters.name_contains = selectedFilters.name_contains
      }
      
      // Цветовые фильтры
      if (selectedFilters.color?.length) {
        filters.color_in = selectedFilters.color
      }
      
      // Фильтр по размерам
      if (selectedFilters.sizes?.length) {
        filters.sizes_contains = selectedFilters.sizes
      }
      
      // Ценовой диапазон
      if (selectedFilters.priceFrom !== null) {
        filters.newPrice_gte = selectedFilters.priceFrom
      }
      if (selectedFilters.priceTo !== null) {
        filters.newPrice_lte = selectedFilters.priceTo
      }
      
      // Фильтры состояния
      if (selectedFilters.withDiscount) {
        filters.withDiscount = true
      }
      
      if (selectedFilters.hasImage) {
        filters.image_null = false
      }
      if (selectedFilters.noImage) {
        filters.image_null = true
      }
      
      if (selectedFilters.lowStock) {
        filters.countSizes_lte = 5
      }
      if (selectedFilters.inStock) {
        filters.countSizes_gt = 0
      }
      
      // Сортировка
      let sortParam = null
      if (selectedFilters.sortBy) {
        sortParam = selectedFilters.sortBy
      }
      
      emit('on-search', hasFilters.value ? { ...filters, sort: sortParam } : { sort: sortParam })
    }

    function applyFilters() {
      search()
      leftDrawerOpen.value = false
    }

    function clear() {
      colorPickerRef.value?.clear()
      Object.keys(selectedFilters).forEach(key => {
        if (Array.isArray(selectedFilters[key])) {
          selectedFilters[key] = []
        } else if (typeof selectedFilters[key] === 'boolean') {
          selectedFilters[key] = false
        } else {
          selectedFilters[key] = null
        }
      })
      search()
      toggleLeftDrawer()
    }

    // Загружаем размеры при монтировании компонента
    onMounted(() => {
      fetchAvailableSizes()
    })

    return {
      toggleLeftDrawer,
      clear,
      search,
      leftDrawerOpen,
      scrolledTop,
      selectedFilters,
      colorPickerRef,
      hasFilters,
      sortOptions,
      removeSize,
      applyFilters,
      availableSizes,
      loadingAvailableSizes,
      toggleSize
    }
  }
})
</script>

<style lang="scss" scoped>
.filters {
  position: sticky;
  top: 10px;
  z-index: 10;

  .alert_dot {
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background-color: red;
    position: absolute;
    right: 0px;
    top: 0px;
    transition: all 0.2s ease;
  }

  .pulse-animation {
    position: absolute;
    background-color: var(--deep-orange);
    border: 5px solid var(--deep-orange);
    border-radius: 50%;
    animation: pulsate infinite 1.5s;
  }

  @keyframes pulsate {
    0% {
      transform: scale(1, 1);
      opacity: 1;
    }
    100% {
      transform: scale(1.3, 1.3);
      opacity: 0;
    }
  }
}

.dialog-close {
  width: 100%;
  height: 20px;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 2;
  background-color: var(--block-bg);

  &-line {
    width: 40px;
    height: 5px;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: var(--border-radius-sm);
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
  }
}

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
