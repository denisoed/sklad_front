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
      <template v-if="!selectedFilters.name_contains" #append>
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
      @click="leftDrawerOpen = true"
      v-vibrate
    >
      <q-icon
        name="mdi-filter-variant"
      />
      <div v-if="hasFilters" class="alert_dot" />
    </q-btn>

    <!-- Расширенные фильтры -->
    <FilterDialog
      v-model="leftDrawerOpen"
      :filters="selectedFilters"
      @apply="applyFilters"
      @clear="clear"
    />
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  ref,
  reactive,
} from 'vue'
import BtnBack from 'src/components/BtnBack.vue'
import FilterDialog from 'src/components/Dialogs/FilterDialog.vue'

export default defineComponent({
  name: 'FiltersComp',
  components: {
    BtnBack,
    FilterDialog
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

    const hasFilters = computed(() => {
      return Object.keys(selectedFilters).some(key => {
        const value = selectedFilters[key]
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'boolean') return value
        return value !== null && value !== undefined && value !== ''
      })
    })

    function search() {
      const filters = {}
      if (selectedFilters.name_contains) {
        filters.name_contains = selectedFilters.name_contains
      }
      if (selectedFilters.color?.length) {
        filters.color_in = selectedFilters.color
      }
      if (selectedFilters.sizes?.length) {
        filters.sizes_contains = selectedFilters.sizes
      }
      if (selectedFilters.priceFrom !== null) {
        filters.newPrice_gte = selectedFilters.priceFrom
      }
      if (selectedFilters.priceTo !== null) {
        filters.newPrice_lte = selectedFilters.priceTo
      }
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
      let sortParam = null
      if (selectedFilters.sortBy) {
        sortParam = selectedFilters.sortBy
      }
      emit('on-search', hasFilters.value ? { ...filters, sort: sortParam } : { sort: sortParam })
    }

    function applyFilters(newFilters) {
      Object.assign(selectedFilters, newFilters)
      search()
    }

    function clear() {
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
    }

    return {
      clear,
      search,
      leftDrawerOpen,
      selectedFilters,
      hasFilters,
      applyFilters,
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
</style>