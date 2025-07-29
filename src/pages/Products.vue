<template>
  <q-page>
    <div class="products container">
      <FiltersComp
        :loading="searchLoading"
        :autofocus="searchAutofocus"
        @on-search="onSearch"
        @clear="onClear"
      />

      <p class="q-mb-sm text-subtitle2">Склады</p>
      <MiniTabs
        :list="skladsTabs"
        :selected-id="selectedSkladId"
        class="q-mb-md"
        @on-change="onChangeSklad"
      />

      <!-- Categories -->
      <p class="q-mb-sm text-subtitle2">Категории</p>
      <MiniTabs
        :list="categories"
        :selected-id="selectedCategoryId"
        class="mini-tabs-categories q-pb-md"
        @on-change="onChangeCategory"
      />
        
      <template v-if="products?.length">
        <div class="flex items-center justify-between q-mb-sm">
          <div class="flex items-center q-gap-sm">
            <p class="q-mb-none text-subtitle2">Товары</p>
            <q-badge color="primary" :label="products.length" />
          </div>
          
          <div class="flex items-center q-gap-sm">
            <!-- View Mode Toggle -->
            <q-btn
              :icon="viewMode === VIEW_GRID ? 'mdi-view-list' : 'mdi-view-grid'"
              @click="toggleViewMode"
              text-color="primary"
              push
              round
              size="sm"
            />
            
            <q-btn
              :to="`/sklad/${selectedSkladId}`"
              class="text-subtitle2"
              push
              text-color="primary"
              round
              size="sm"
            >
              <q-icon
                name="mdi-open-in-new"
                size="xs"
              />
            </q-btn>
          </div>
        </div>

        <!-- Grid View -->
        <ProductsGrid
          v-if="viewMode === VIEW_GRID"
          :products="products"
          v-model:bulk-products="bulkProducts"
          @open-image-preview="onOpenImagePreview"
          @add-count-to-bucket="onAddCountToBucket"
          @add-sizes-to-bucket="onAddSizesToBucket"
          @open-count-modal="onOpenCountModal"
          @open-sizes-modal="onOpenSizesModal"
        />
        
        <!-- Table View -->
        <ProductsTable
          v-else
          :products="products"
          v-model:bulk-products="bulkProducts"
          @open-image-preview="onOpenImagePreview"
          @add-count-to-bucket="onAddCountToBucket"
          @add-sizes-to-bucket="onAddSizesToBucket"
          @open-count-modal="onOpenCountModal"
          @open-sizes-modal="onOpenSizesModal"
        />
      </template>
      <h6
        v-else
        class="full-width flex column items-center text-center text-grey-5"
      >
        <span
          v-if="searchLoading"
        >
          <q-icon
            size="sm"
            name="mdi-loading"
            class="mdi-spin q-mr-sm "
          />
          Загрузка...
        </span>
        <div v-else class="flex column items-center">
          <span>
            <q-icon size="sm" name="mdi-basket-outline" class="q-mr-xs text-grey-5" />
            Список пуст
          </span>
          <p class="q-mt-md text-subtitle2 text-grey-5" style="max-width:220px;">
            Не удалось найти товары
          </p>
        </div>
      </h6>
    </div>
    <ProductControls
      :show="Boolean(bulkProducts?.length)"
      :title="`Выбрано: ${bulkProducts?.length}`"
      @on-close="onCloseBulk"
      @on-finish-remove="onFinishRemove"
      @on-finish-update="onFinishUpdate"
    />

    <!-- Image Preview Dialog -->
    <q-dialog v-model="imagePreviewDialog" position="bottom">
      <q-swipe-to-close
        v-model="imagePreviewDialog"
        direction="down"
      >
        <q-card class="full-width">
          <q-img
            :src="imagePreview"
            spinner-size="md"
            spinner-color="grey"
          />
          <q-btn
            round
            push
            color="deep-orange"
            size="sm"
            v-close-popup
            class="absolute-top-right q-mr-md q-mt-md"
          >
            <q-icon
              name="mdi-close"
              color="white"
            />
          </q-btn>
        </q-card>
      </q-swipe-to-close>
    </q-dialog>

    <!-- Count Modal -->
    <ModalCountToBucket
      v-model="countModalVisible"
      :max="selectedProduct?.countSizes"
      :prices="selectedProduct?.prices"
      :new-price="selectedProduct?.withDiscount ? selectedProduct?.discountPrice : selectedProduct?.newPrice"
      @submit="onAddCountToBucket(selectedProduct, $event)"
    />

    <!-- Sizes Modal -->
    <ModalSizesToBucket
      v-model="sizesModalVisible"
      :sizes="selectedProduct?.sizes"
      :prices="selectedProduct?.prices"
      :type-sizes="selectedProduct?.typeSize?.list || []"
      :new-price="selectedProduct?.withDiscount ? selectedProduct?.discountPrice : selectedProduct?.newPrice"
      @submit="onAddSizesToBucket(selectedProduct, $event)"
    />
  </q-page>
</template>

<script>
import {
  computed,
  defineComponent,
  onBeforeMount,
  ref,
  reactive,
  onMounted,
  watch
} from 'vue'
import useSklads from 'src/modules/useSklads'
import useProduct from 'src/modules/useProduct'
import useCategories from 'src/modules/useCategories'
import useBucket from 'src/modules/useBucket'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBulkStore } from 'src/stores/bulk';

import FiltersComp from 'src/components/FiltersComp.vue'
import ProductControls from 'src/components/ProductControls.vue'
import MiniTabs from 'src/components/Product/MiniTabs.vue'
import ProductsGrid from 'src/components/Product/ProductsGrid.vue'
import ProductsTable from 'src/components/Product/ProductsTable.vue'
import ModalCountToBucket from 'src/components/Dialogs/ModalCountToBucket.vue'
import ModalSizesToBucket from 'src/components/Dialogs/ModalSizesToBucket.vue'

const ALL_TAB = {
  id: 0,
  name: 'Все',
  color: '#fff'
}

const VIEW_TABLE = 'table'
const VIEW_GRID = 'grid'

import {
  CAN_SELL_PRODUCT,
  CAN_UPDATE_PRODUCT
} from 'src/permissions'

export default defineComponent({
  name: 'ProductsPage',
  components: {
    FiltersComp,
    ProductControls,
    MiniTabs,
    ProductsGrid,
    ProductsTable,
    ModalCountToBucket,
    ModalSizesToBucket
  },
  props: {
    searchAutofocus: {
      type: Boolean,
      deafult: false,
    }
  },
  setup() {
    const bulkStore = useBulkStore();
    const { bulkProducts } = storeToRefs(bulkStore);
    const { params, query } = useRoute()
    const router = useRouter()
    const {
      sklad,
      sklads,
      skladProducts,
    } = useSklads()
    const { forceRefreshBucket } = useBucket()
    const {
      categoriesResult,
      loadCategories,
    } = useCategories()
    const {
      addSizesToBucket,
      searchProducts,
      addCountToBucket,
      products,
      searchLoading
    } = useProduct()

    const selectedSkladId = ref(
      params?.skladId || ALL_TAB.id
    )
    const imagePreviewDialog = ref(false)
    const imagePreview = ref(null)
    const selectedCategoryId = ref(params?.categoryId || ALL_TAB.id)
    const selectedFilters = reactive({})
    const showFiltersInfo = ref(false)
    
    // Modal states
    const countModalVisible = ref(false)
    const sizesModalVisible = ref(false)
    const selectedProduct = ref(null)
    
    // View mode toggle (grid/table)
    const viewMode = ref(localStorage.getItem('products-view-mode') || VIEW_GRID)
    
    // Вычисляемые свойства для работы с фильтрами
    const hasActiveFilters = computed(() => {
      const { sort, ...filters } = selectedFilters.value || {}
      return Object.keys(filters).some(key => {
        const value = filters[key]
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'boolean') return value
        return value !== null && value !== undefined && value !== ''
      })
    })
    
    const activeFiltersCount = computed(() => {
      const { sort, ...filters } = selectedFilters.value || {}
      return Object.keys(filters).filter(key => {
        const value = filters[key]
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'boolean') return value
        return value !== null && value !== undefined && value !== ''
      }).length
    })
    
    const activeFiltersInfo = computed(() => {
      const { sort, ...filters } = selectedFilters.value || {}
      const info = []
      
      const filterLabels = {
        name_contains: 'Поиск по имени',
        withDiscount: 'Со скидкой',
        priceFrom: 'Цена от',
        priceTo: 'Цена до',
        color_in: 'Цвета',
        sizes_contains: 'Размеры',
        hasImage: 'С изображением',
        noImage: 'Без изображения',
        lowStock: 'Заканчивается',
        inStock: 'В наличии'
      }
      
      Object.keys(filters).forEach(key => {
        const value = filters[key]
        if (Array.isArray(value) && value.length > 0) {
          info.push({
            key,
            label: `${filterLabels[key] || key}: ${value.join(', ')}`
          })
        } else if (typeof value === 'boolean' && value) {
          info.push({
            key,
            label: filterLabels[key] || key
          })
        } else if (value !== null && value !== undefined && value !== '') {
          info.push({
            key,
            label: `${filterLabels[key] || key}: ${value}`
          })
        }
      })
      
      return info
    })

    function removeFilter(filterKey) {
      if (selectedFilters.value[filterKey] !== undefined) {
        if (Array.isArray(selectedFilters.value[filterKey])) {
          selectedFilters.value[filterKey] = []
        } else if (typeof selectedFilters.value[filterKey] === 'boolean') {
          selectedFilters.value[filterKey] = false
        } else {
          selectedFilters.value[filterKey] = null
        }
        
        onSearch(selectedFilters.value)
      }
    }
  
    function initFiltersFromUrl() {
      try {
        if (query.filters) {
          const urlFilters = JSON.parse(decodeURIComponent(query.filters))
          Object.assign(selectedFilters, urlFilters)
        }
      } catch (error) {
        console.warn('Не удалось загрузить фильтры из URL:', error)
      }
    }

    function saveFiltersToUrl(filters) {
      const hasFilters = Object.keys(filters).some(key => {
        const value = filters[key]
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'boolean') return value
        return value !== null && value !== undefined && value !== ''
      })
      
      if (hasFilters) {
        router.replace({
          query: {
            ...query,
            filters: encodeURIComponent(JSON.stringify(filters))
          }
        })
      } else {
        const { filters: _, ...newQuery } = query
        router.replace({ query: newQuery })
      }
    }

    const skladsTabs = computed(() => {
      return [ALL_TAB, ...sklads.value]
    })

    const categories = computed(
      () => {
        const categories = categoriesResult.value?.categories || []
        const skladCategories =
          categories.filter(c => c.sklad.id === selectedSkladId.value)
        
        return [
          ALL_TAB,
          ...(selectedSkladId.value === ALL_TAB.id ? categories : skladCategories)
        ]
      }
    );

    async function onAddSizesToBucket(product, payload) {
      await addSizesToBucket(product, payload)
      await forceRefreshBucket()
      loadData()
      sizesModalVisible.value = false
      selectedProduct.value = null
    }

    async function onAddCountToBucket(product, payload) {
      await addCountToBucket(product, payload)
      await forceRefreshBucket()
      loadData()
      countModalVisible.value = false
      selectedProduct.value = null
    }

    function onCloseBulk() {
      bulkStore.setBulkProducts([])
    }

    function onFinishUpdate() {
      loadData()
      onCloseBulk()
    }

    async function onFinishRemove() {
      onCloseBulk()
      await loadData()
      await forceRefreshBucket()
    }

    // Scroll to card by id from url and highlight it
    function onScrollToCard() {
      const id = query.product;
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        })
        element.classList.add('highlight')
        setTimeout(() => {
          element.classList.remove('highlight')
        }, 10000)
      }
    }

    function onClear() {
      selectedSkladId.value = ALL_TAB.id
      selectedCategoryId.value = ALL_TAB.id
    }

    async function loadData() {
      const { sort, ...otherFilters } = selectedFilters.value || {};
      const sizes = otherFilters.sizes
      const filters = { ...otherFilters }
      delete filters.sizes
      const resp = await searchProducts({
        q: filters.name_contains || null,
        where: {
          ...(selectedSkladId.value ? { sklad: selectedSkladId.value } : {}),
          ...(selectedCategoryId.value ? { category: selectedCategoryId.value } : {}),
          ...filters
        },
        sizes: sizes?.length ? sizes : null
      })
      return resp;
    }

    async function onSearch(filters = {}) {
      const { sort, ...otherFilters } = filters;
      
      selectedFilters.value = {
        ...otherFilters,
        sort
      };
      
      saveFiltersToUrl(filters);
      
      const hasSearchFilters = Object.keys(otherFilters).some(key => 
        key !== 'sort' && otherFilters[key] !== null && otherFilters[key] !== undefined && 
        (Array.isArray(otherFilters[key]) ? otherFilters[key].length > 0 : otherFilters[key] !== '')
      );
      
      if (hasSearchFilters) {
        selectedCategoryId.value = ALL_TAB.id;
        selectedSkladId.value = ALL_TAB.id;
      }
      
      loadData();
    }
    
    function onChangeSklad(id) {
      selectedSkladId.value = id;
      selectedCategoryId.value = ALL_TAB.id;
      loadData();
    }

    function onChangeCategory(id) {
      selectedCategoryId.value = id;
      loadData();
    }

    function onOpenImagePreview(url) {
      imagePreview.value = url
      imagePreviewDialog.value = true
    }

    function onOpenCountModal(product) {
      selectedProduct.value = product
      countModalVisible.value = true
    }

    function onOpenSizesModal(product) {
      selectedProduct.value = product
      sizesModalVisible.value = true
    }

    function toggleViewMode() {
      viewMode.value = viewMode.value === VIEW_GRID ? VIEW_TABLE : VIEW_GRID
    }
    
    onBeforeMount(() => {
      initFiltersFromUrl();
      loadData();
      loadCategories(
        null,
        { where: { sklad: sklads.value.map(s => s.id) }},
        { fetchPolicy: 'network-only' }
      )
    })

    onMounted(() => {
      setTimeout(() => {
        onScrollToCard()
      }, 300);
    })

    watch(viewMode, (newValue) => {
      localStorage.setItem('products-view-mode', newValue)
    })

    return {
      searchLoading,
      onSearch,
      onClear,
      sklad,
      sklads,
      params,
      onAddSizesToBucket,
      onAddCountToBucket,
      CAN_SELL_PRODUCT,
      CAN_UPDATE_PRODUCT,
      onFinishRemove,
      onCloseBulk,
      onFinishUpdate,
      bulkProducts,
      onChangeSklad,
      selectedSkladId,
      categories,
      onChangeCategory,
      selectedCategoryId,
      skladProducts,
      products,
      imagePreviewDialog,
      imagePreview,
      onOpenImagePreview,
      onOpenCountModal,
      onOpenSizesModal,
      countModalVisible,
      sizesModalVisible,
      selectedProduct,
      hasActiveFilters,
      activeFiltersCount,
      activeFiltersInfo,
      showFiltersInfo,
      removeFilter,
      viewMode,
      toggleViewMode,
      VIEW_GRID,
      VIEW_TABLE,
      skladsTabs
    }
  }
})
</script>

<style lang="scss" scoped>
.sell-count {
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: normal;
  color: #000;
  font-size: 14px;
  background-color: #fff;
  border-radius: 100%;
  box-shadow: rgba(100, 100, 111, 0.6) 0px 7px 29px 0px;
  position: absolute;
  top: -8px;
  right: -6px;
}

.highlight {
  box-shadow: rgba(var(--q-primary-rgb), 1) 0px 0px 3px 3px;
  animation: fade-out 10s forwards;
}

.products {
  :deep(.small-card_color) {
    display: none;
  }

  :deep(.mini-tabs-categories) {
    .small-card {
      width: auto;
      min-width: 100px;
    }
  }
}

@keyframes fade-out {
  0% {
    box-shadow: rgba(var(--q-primary-rgb), 0.6) 0px 0px 3px 3px;
  }
  100% {
    box-shadow: var(--box-shadow);
  }
}

.slide-down-enter-active {
  transition: all .3s ease;
}
.slide-down-leave-active {
  transition: all .5s ease;
}
.slide-down-enter, .slide-down-leave-to {
  transform: translateY(50px);
  opacity: 0;
}
.slide-down-enter-from {
  transform: translateY(50px);
  opacity: 0;
}

.text-underline {
  text-decoration: underline;
}
</style>
