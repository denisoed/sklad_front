<template>
  <q-page>
    <div class="create-bundle container">
      <PageTitle :title="$t('bundle.createBundleTitle')" />

      <!-- Step indicator -->
      <div class="flex items-center q-gap-sm q-mb-md">
        <q-badge
          :color="step === 1 ? 'primary' : 'grey'"
          :label="`${$t('common.step')} 1`"
        />
        <q-icon name="mdi-chevron-right" color="grey" />
        <q-badge
          :color="step === 2 ? 'primary' : 'grey'"
          :label="`${$t('common.step')} 2`"
        />
      </div>

      <!-- Description -->
      <AlertBox 
        :text="$t('bundle.warningDescription')" 
        id="bundle-warning-description" 
      />

      <!-- Step 1: Product Selection -->
      <div v-if="step === 1" class="step-content">
        <p class="q-mb-sm text-subtitle2">{{ $t('pages.warehousesLabel') }}</p>
        <MiniTabs
          :list="skladsTabs"
          :selected-id="selectedSkladId"
          scroll-to-active-tab
          class="q-mb-sm mini-tabs-sklads"
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
            <p class="q-mb-none text-subtitle2">{{ $t('pages.selected') }}</p>
            <q-badge color="primary" :label="bundleStore.getSelectedProductsCount" />
          </div>
        </div>

        <!-- Products Table -->
        <div v-if="localProducts?.length" class="products-table-container">
          <q-table
            :rows="localProducts"
            :columns="columns"
            row-key="id"
            flat
            separator="cell"
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
            class="bundle-products-table block-bg border-radius-sm"
          >
            <template #body="props">
              <q-tr :props="props">
                <q-td :props="props" class="text-left" :class="{ 'accent-bg': getAccentBg(props.row) }" key="info">
                  <div class="text-caption text-grey-6">#{{ props.row.id }}</div>
                  <div class="text-bold">{{ props.row.name }}</div>
                </q-td>
                <q-td :props="props" class="text-left" :class="{ 'accent-bg': getAccentBg(props.row) }" key="sizes">
                  <InputPlusMinus
                    v-if="props.row.useNumberOfSizes"
                    :min="0"
                    :max="props.row.countSizes"
                    :model-value="props.row.qty || 0"
                    @update:model-value="val => updateQty(props.row, val)"
                    :label="$t('common.quantity')"
                  />
                  <div v-else class="btn-sizes_list q-mt-xs">
                    <template v-for="(sizeObj, idx) in getSizesListForRow(props.row)" :key="idx">
                      <q-btn
                        :color="sizeObj.countSelected ? 'primary' : 'white'"
                        text-color="white"
                        :outline="!sizeObj.countSelected"
                        push
                        class="btn-sizes-btn border-radius-sm q-mr-xs q-mb-xs"
                        @click="onSizeBtnClick(props.row, sizeObj)"
                      >
                        <span>{{ sizeObj.size }}<sup v-if="sizeObj.count > 1">{{ sizeObj.count > 1 ? `(${sizeObj.count} ${$t('common.pieces')})` : '' }}</sup></span>
                        <q-badge v-if="sizeObj.countSelected > 1" color="red" floating>{{ sizeObj.countSelected }}</q-badge>
                      </q-btn>
                    </template>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>

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

      <!-- Step 2: Bundle Configuration (placeholder) -->
      <div v-else-if="step === 2" class="step-content">
        <div class="text-center q-pa-xl">
          <q-icon name="mdi-cog" size="100px" color="grey-4" />
          <h6 class="q-mt-md text-grey-6">{{ $t('bundle.step2Placeholder') }}</h6>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="create-bundle_controls flex justify-between full-width q-mt-lg">
        <q-btn
          v-if="step > 1"
          color="grey"
          :icon="step === 2 ? 'mdi-arrow-left' : 'mdi-arrow-left'"
          :label="step === 2 ? $t('common.back') : $t('common.previous')"
          push
          @click="previousStep"
        />
        <div></div> <!-- Spacer -->
        <q-btn
          v-if="step < 2"
          color="primary"
          :label="$t('common.next')"
          push
          :disable="!canProceed"
          @click="nextStep"
        />
        <q-btn
          v-if="step === 2"
          color="success"
          icon="mdi-check"
          :label="$t('bundle.createBundle')"
          push
          @click="createBundle"
        />
      </div>
    </div>

    <!-- Size Selection Modal -->
    <ModalSizeSelection
      v-model="sizeModalVisible"
      :size="selectedSize"
      :max-count="selectedSize?.count || 0"
      @submit="onSizeSelectionSubmit"
    />
  </q-page>
</template>

<script setup>
import { computed, onBeforeMount, onUnmounted, ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useSklads from 'src/modules/useSklads'
import useProduct from 'src/modules/useProduct'
import useCategories from 'src/modules/useCategories'
import { useBundleStore } from 'src/stores/bundle'

import MiniTabs from 'src/components/MiniTabs.vue'
import InputPlusMinus from 'src/components/InputPlusMinus.vue'
import ModalSizeSelection from 'src/components/Dialogs/ModalSizeSelection.vue'
import PageTitle from 'src/components/PageTitle.vue'
import AlertBox from 'src/components/AlertBox.vue'

defineOptions({
  name: 'CreateBundle'
})

const { t: $t } = useI18n()
const router = useRouter()
const bundleStore = useBundleStore()

const step = ref(1)
const selectedSkladId = ref(bundleStore.getSelectedSkladId)
const selectedCategoryId = ref(bundleStore.getSelectedCategoryId)
const selectedProducts = computed(() => bundleStore.getSelectedProducts)
const localProducts = ref([])
const sizeModalVisible = ref(false)
const selectedSize = ref(null)
const selectedProduct = ref(null)

const { sklads } = useSklads()
const { categories: categoriesResult, fetchCategories } = useCategories()
const {
  searchProducts,
  products,
  searchLoading
} = useProduct()

const selectedFilters = reactive({})

const ALL_TAB = computed(() => ({
  id: 0,
  name: $t('common.all'),
  color: '#fff'
}))

const columns = [
  {
    name: 'info',
    label: $t('common.product'),
    field: 'info',
    align: 'left'
  },
  {
    name: 'sizes',
    label: `${$t('common.sizes')}/${$t('common.quantity')}`,
    field: 'sizes',
    align: 'left',
    style: 'min-width: 200px'
  }
]

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

const canProceed = computed(() => {
  return bundleStore.getSelectedProductsCount > 0
})

function getCountSize(size, sizesArr) {
  let count = 0
  sizesArr.forEach(s => {
    if (s.size === size) {
      count += 1
    }
  })
  return count
}

function getSizesListForRow(row) {
  const uniqueSizes = [...new Set((row.sizes || []).map(s => s.size))]
  return uniqueSizes.map(size => {
    const count = getCountSize(size, row.sizes)
    const selected = row.selectedSizes ? row.selectedSizes.filter(sel => sel.size === size).length : 0
    return {
      size,
      countSelected: selected,
      count,
      has: (row.sizes || []).some(s => s.size === size)
    }
  })
}

function onProductSelect(product) {
  // Check if product is selected based on its state
  const isSelected = product.useNumberOfSizes 
    ? (product.qty > 0)
    : (product.selectedSizes && product.selectedSizes.length > 0)
  
  if (isSelected) {
    bundleStore.addSelectedProduct({
      id: product.id,
      name: product.name,
      useNumberOfSizes: product.useNumberOfSizes,
      sizes: product.sizes || [],
      countSizes: product.countSizes,
      selectedSizes: product.selectedSizes || [],
      qty: product.qty || 0
    })
  } else {
    bundleStore.removeSelectedProduct(product.id)
  }
}

function onSizeBtnClick(product, sizeObj) {
  if (sizeObj.count > 1) {
    selectedProduct.value = product
    selectedSize.value = sizeObj
    sizeModalVisible.value = true
    return
  }
  
  const idx = localProducts.value.findIndex(p => p.id === product.id)
  if (idx !== -1) {
    const selectedSizes = localProducts.value[idx].selectedSizes || []
    if (sizeObj.countSelected === 0) {
      selectedSizes.push({ size: sizeObj.size })
    } else {
      localProducts.value[idx].selectedSizes = selectedSizes.filter(sel => sel.size !== sizeObj.size)
      return
    }
    localProducts.value[idx].selectedSizes = selectedSizes
    
    // Update selected products
    onProductSelect(localProducts.value[idx])
  }
}

function onSizeSelectionSubmit(count) {
  if (!selectedProduct.value || !selectedSize.value) return
  
  const idx = localProducts.value.findIndex(p => p.id === selectedProduct.value.id)
  if (idx !== -1) {
    localProducts.value[idx].selectedSizes = (localProducts.value[idx].selectedSizes || []).filter(sel => sel.size !== selectedSize.value.size)
    for (let i = 0; i < count; i++) {
      localProducts.value[idx].selectedSizes.push({ size: selectedSize.value.size })
    }
    
    // Update selected products
    onProductSelect(localProducts.value[idx])
  }
  
  sizeModalVisible.value = false
  selectedSize.value = null
  selectedProduct.value = null
}

function updateQty(product, val) {
  const idx = localProducts.value.findIndex(p => p.id === product.id)
  if (idx !== -1) {
    localProducts.value[idx].qty = val
    
    // Update selected products
    onProductSelect(localProducts.value[idx])
  }
}

function nextStep() {
  if (step.value < 2) {
    step.value++
  }
}

function previousStep() {
  if (step.value > 1) {
    step.value--
  }
}



function createBundle() {
  // TODO: Implement bundle creation logic
  console.log('Creating bundle with products:', bundleStore.getSelectedProducts)
}

function getAccentBg(row) {
  if (row.useNumberOfSizes) {
    return row.qty > 0
  }
  return row.selectedSizes && row.selectedSizes.length > 0
}

function onChangeSklad(id) {
  selectedSkladId.value = id
  selectedCategoryId.value = ALL_TAB.value.id
  bundleStore.setSelectedSklad(id)
  bundleStore.setSelectedCategory(ALL_TAB.value.id)
  loadData()
}

function onChangeCategory(id) {
  selectedCategoryId.value = id
  bundleStore.setSelectedCategory(id)
  loadData()
}

function onLongPressSklad(id) {
  if (id !== ALL_TAB.value.id) {
    router.push(`/sklad/${id}`)
  }
}

function restoreSelections() {
  const restoredProducts = bundleStore.restoreProductSelections(products.value)
  if (restoredProducts) {
    localProducts.value = restoredProducts.map(item => {
      if (item.useNumberOfSizes) {
        return { ...item, qty: item.qty || 0 }
      }
      return { ...item, selectedSizes: item.selectedSizes ? [...item.selectedSizes] : [] }
    })
  }
}

async function loadData() {
  const { sort, ...otherFilters } = selectedFilters.value || {}
  const sizes = otherFilters.sizes
  const search = otherFilters.search
  const filters = { ...otherFilters }
  delete filters.sizes
  delete filters.search
  
  await searchProducts({
    q: search || null,
    where: {
      ...(selectedSkladId.value ? { sklad: selectedSkladId.value } : {}),
      ...(selectedCategoryId.value ? { category: selectedCategoryId.value } : {}),
      ...filters
    },
    sizes: sizes?.length ? sizes : null
  })
  
  // Sync store with new products and restore selections
  if (products.value) {
    restoreSelections()
  }
}

onBeforeMount(() => {
  // Initialize store with current selections
  bundleStore.setSelectedSklad(selectedSkladId.value)
  bundleStore.setSelectedCategory(selectedCategoryId.value)
  loadData()
})

onUnmounted(() => {
  // Clear only navigation state when component is unmounted
  // Keep selectedProducts for persistence between tab changes
  bundleStore.clearNavigationState()
})

watch(
  products,
  (val) => {
    if (val && !localProducts.value.length) {
      restoreSelections()
    }
  },
  { immediate: true }
)

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
.create-bundle {
  .step-content {
    min-height: 400px;
  }

  &_controls {
    position: sticky;
    bottom: 100px;
  }
}

.bundle-products-table {
  :deep(.q-table__top),
  :deep(.q-table__bottom),
  :deep(.q-table__bottom) .q-table__control {
    display: none;
  }
  
  :deep(.q-table) {
    border-radius: var(--border-radius-sm);
    overflow: hidden;
  }
}

.btn-sizes_list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.btn-sizes-btn {
  min-width: 0;
  flex: 0 1 auto;
}

.mini-tabs-sklads {
  :deep(.small-card) {
    min-width: 120px;
  }

  :deep(.small-card_color) {
    display: none;
  }
}

.mini-tabs-categories {
  :deep(.small-card_color) {
    display: none;
  }
}

.products-table-container {
  max-height: 60vh;
  overflow-y: auto;
}

.accent-bg {
  background-color: rgba(var(--q-primary-rgb), 0.1);
}
</style>
