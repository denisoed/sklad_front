<template>
  <q-page>
    <div class="products container">
      <FiltersComp
        :loading="searchLoading"
        :autofocus="searchAutofocus"
        @on-search="onSearch"
        @clear="onClear"
      />

      <p class="q-mb-sm text-subtitle2">{{ $t('pages.warehousesLabel') }}</p>
      <MiniTabs
        :list="skladsTabs"
        :selected-id="selectedSkladId"
        scroll-to-active-tab
        class="q-mb-md"
        @on-change="onChangeSklad"
        @long-press="onLongPressSklad"
      />

      <p class="q-mb-sm text-subtitle2">{{ $t('pages.categoriesLabel') }}</p>
      <MiniTabs
        :list="categories"
        scroll-to-active-tab
        :selected-id="selectedCategoryId"
        class="mini-tabs-categories q-mb-lg"
        @on-change="onChangeCategory"
      />
        
      <div class="flex items-center justify-between q-mb-md block-bg q-pl-md q-pr-xs q-py-xs border-radius-xxxl">
        <div class="flex items-center q-gap-sm">
          <p class="q-mb-none text-subtitle2">{{ $t('pages.productsLabel') }}</p>
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

          <!-- Create Product -->
          <q-btn
            icon="mdi-plus"
            round
            size="sm"
            color="primary"
            push
            :to="newProductUrl"
          />
        </div>
      </div>

      <template v-if="products?.length">
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
          {{ $t('pages.loading') }}
        </span>
        <div v-else class="flex column items-center">
          <span>
            <q-icon size="sm" name="mdi-cart-outline" class="q-mr-xs text-grey-5" />
            {{ $t('pages.listIsEmpty') }}
          </span>
          <p class="q-mt-md text-subtitle2 text-grey-5" style="max-width:220px;">
            {{ $t('pages.noProductsFound') }}
          </p>
        </div>
      </h6>
    </div>
    <ProductControls
      :show="Boolean(bulkProducts?.length)"
      :title="`${$t('pages.selected')}: ${bulkProducts?.length}`"
      @on-close="onCloseBulk"
      @on-finish-remove="onFinishRemove"
      @on-finish-update="onFinishUpdate"
    />

    <!-- Image Preview Dialog -->
    <ImagePreviewDialog
      v-model="imagePreviewDialog"
      :image-src="imagePreview"
    />

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

<script setup>
import { computed, onBeforeMount, ref, reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import useSklads from 'src/modules/useSklads'
import useProduct from 'src/modules/useProduct'
import useCategories from 'src/modules/useCategories'
import useBucket from 'src/modules/useBucket'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBulkStore } from 'src/stores/bulk'

import FiltersComp from 'src/components/FiltersComp.vue'
import ProductControls from 'src/components/ProductControls.vue'
import MiniTabs from 'src/components/Product/MiniTabs.vue'
import ProductsGrid from 'src/components/Product/ProductsGrid.vue'
import ProductsTable from 'src/components/Product/ProductsTable.vue'
import ModalCountToBucket from 'src/components/Dialogs/ModalCountToBucket.vue'
import ModalSizesToBucket from 'src/components/Dialogs/ModalSizesToBucket.vue'
import ImagePreviewDialog from 'src/components/ImagePreviewDialog.vue'

const VIEW_TABLE = 'table'
const VIEW_GRID = 'grid'

defineOptions({
  name: 'Products'
})

const { t: $t } = useI18n()

defineProps({
  searchAutofocus: {
    type: Boolean,
    deafult: false
  }
})

const bulkStore = useBulkStore()
const { bulkProducts } = storeToRefs(bulkStore)

const ALL_TAB = computed(() => ({
  id: 0,
  name: $t('products.all'),
  color: '#fff'
}))

const route = useRoute()
const router = useRouter()
const { sklads } = useSklads()
const { forceRefreshBucket } = useBucket()
const { categories: categoriesResult, fetchCategories } = useCategories()
const {
  addSizesToBucket,
  searchProducts,
  addCountToBucket,
  products,
  searchLoading
} = useProduct()

const selectedSkladId = ref(route.params?.skladId || route.query?.skladId || ALL_TAB.value.id)
const selectedCategoryId = ref(route.params?.categoryId || route.query?.categoryId || ALL_TAB.value.id)
const imagePreviewDialog = ref(false)
const imagePreview = ref(null)
const selectedFilters = reactive({})

const countModalVisible = ref(false)
const sizesModalVisible = ref(false)
const selectedProduct = ref(null)

const viewMode = ref(localStorage.getItem('products-view-mode') || VIEW_TABLE)

function initFiltersFromUrl() {
  try {
    if (route.query?.filters) {
      const urlFilters = JSON.parse(decodeURIComponent(route.query.filters))
      Object.assign(selectedFilters, urlFilters)
    }
  } catch (error) {
    console.warn('Failed to load filters from URL:', error)
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
        ...route.query,
        filters: encodeURIComponent(JSON.stringify(filters))
      }
    })
  } else {
    const { filters: _, ...newQuery } = route.query
    router.replace({ query: newQuery })
  }
}

const skladsTabs = computed(() => {
  return [ALL_TAB.value, ...sklads.value]
})

const categories = computed(() => {
  const categoriesList = categoriesResult.value || []
  const skladCategories = categoriesList.filter(c => c?.sklad?.id === selectedSkladId.value)
  return [
    ALL_TAB.value,
    ...(selectedSkladId.value === ALL_TAB.value.id ? categoriesList : skladCategories)
  ]
})

const newProductUrl = computed(() => {
  return `/create-product?${Object.entries(route.query).map(([key, value]) => `${key}=${value}`).join('&')}`
})

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

function onScrollToCard() {
  const element = document.getElementById(route.query?.productId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: viewMode.value === VIEW_TABLE ? 'nearest' : 'center'
    })
    element.classList.add('highlight')
    setTimeout(() => {
      element.classList.remove('highlight')
    }, 10000)
  }
}

function onClear() {
  selectedSkladId.value = ALL_TAB.value.id
  selectedCategoryId.value = ALL_TAB.value.id
}

async function loadData() {
  const { sort, ...otherFilters } = selectedFilters.value || {}
  const sizes = otherFilters.sizes
  const search = otherFilters.search
  const filters = { ...otherFilters }
  delete filters.sizes
  delete filters.search
  const resp = await searchProducts({
    q: search || null,
    where: {
      ...(selectedSkladId.value ? { sklad: selectedSkladId.value } : {}),
      ...(selectedCategoryId.value ? { category: selectedCategoryId.value } : {}),
      ...filters
    },
    sizes: sizes?.length ? sizes : null
  })
  return resp
}

async function onSearch(filters = {}) {
  const { sort, ...otherFilters } = filters

  selectedFilters.value = {
    ...otherFilters,
    sort
  }

  saveFiltersToUrl(filters)

  const hasSearchFilters = Object.keys(otherFilters).some(
    key =>
      key !== 'sort' &&
      otherFilters[key] !== null &&
      otherFilters[key] !== undefined &&
      (Array.isArray(otherFilters[key]) ? otherFilters[key].length > 0 : otherFilters[key] !== '')
  )

  if (hasSearchFilters) {
    selectedCategoryId.value = ALL_TAB.value.id
    selectedSkladId.value = ALL_TAB.value.id
  }

  loadData()
}

function onChangeSklad(id) {
  selectedSkladId.value = id
  selectedCategoryId.value = ALL_TAB.value.id
  router.replace({
    query: {
      skladId: id,
    }
  })
  loadData()
}

function onChangeCategory(id) {
  selectedCategoryId.value = id
  router.replace({
    query: {
      ...route.query,
      categoryId: id
    }
  })
  loadData()
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

function onLongPressSklad(id) {
  router.push(`/sklad/${id}`)
}

onBeforeMount(() => {
  initFiltersFromUrl()
  loadData()
  onCloseBulk()
})

onMounted(() => {
  setTimeout(() => {
    onScrollToCard()
  }, 300)
})

watch(viewMode, newValue => {
  localStorage.setItem('products-view-mode', newValue)
})

watch(
  sklads,
  val => {
    if (val.length) {
      fetchCategories({ sklad: sklads.value.map(s => s.id) })
    }
  },
  { immediate: true }
)
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
