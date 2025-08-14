<template>
  <q-page>
    <div class="container">
      <PageTitle :title="$t('bucket.salesProducts')">
        <div>
          <q-card-section class="q-pt-none">
            {{ $t('bucket.salesPageDescription') }}
          </q-card-section>
        </div>
      </PageTitle>

      <template v-if="bucketProducts && bucketProducts.length">
        <div class="flex items-center justify-between q-mb-md block-bg q-pl-md q-pr-xs q-py-xs border-radius-xxxl">
          <div class="flex items-center q-gap-sm">
            <p class="q-mb-none text-subtitle2 ">{{ $t('bucket.orders') }}</p>
            <q-badge color="primary" :label="bucketProducts.length" />
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
          </div>
        </div>

        <!-- Grid View -->
        <BucketGrid
          v-if="viewMode === VIEW_GRID"
          :bucket-products="bucketProducts"
          :selected-product="selectedProduct"
          @update="update"
          @remove="remove"
          @on-checked="onChecked"
          @open-modal-count-to-bucket="onOpenModalCountToBucket"
          @open-modal-sizes-to-bucket="onOpenModalSizesToBucket"
        />
        
        <!-- Table View -->
        <BucketTable
          v-else
          :bucket-products="bucketProducts"
          :checked-sale-products="checkedSaleProducts"
          @open-image-preview="onOpenImagePreview"
          @update="update"
          @remove="remove"
          @update:checked-sale-products="onUpdateCheckedSaleProducts"
          @open-modal-count-to-bucket="onOpenModalCountToBucket"
          @open-modal-sizes-to-bucket="onOpenModalSizesToBucket"
        />
      </template>
      <h6
        v-else
        class="full-width text-center text-grey-5"
      >
        <span
          v-if="bucketProductsLoading"
        >
          <q-icon
            size="sm"
            name="mdi-loading"
            class="mdi-spin q-mr-sm "
          />
          {{ $t('pages.loading') }}
        </span>
        <span
          v-else
        >
          <q-icon
            size="sm"
            name="mdi-cart-outline"
            class="q-mr-sm text-grey-5"
          />
          {{ $t('bucket.emptyBasket') }}
        </span>
      </h6>
      <div class="flex flex-center q-mt-lg">
        <q-btn
          v-if="bucketProducts?.length"
          :label="$t('bucket.sellProducts')"
          push
          color="primary"
          @click="toSell"
          :loading="isLoading"
          :disable="bucketProducts && !bucketProducts.length"
        />
        <q-btn
          v-else
          :label="$t('bucket.addToBasket')"
          push
          color="primary"
          to="/products"
        />
      </div>
    </div>

    <!-- Dialog -->
    <ModalCountToBucket
      v-model="modalCountToBucket"
      :selected="selectedSaleProduct?.countSizes"
      :max="selectedSaleProduct?.countSizes"
      :discount-price="selectedSaleProduct?.discount"
      :percentage-discount="selectedSaleProduct?.percentageDiscount"
      :cash-sum="selectedSaleProduct?.cashSum"
      :card-sum="selectedSaleProduct?.cardSum"
      :pay-cash="selectedSaleProduct?.payCash"
      :pay-card="selectedSaleProduct?.payCard"
      :comment="selectedSaleProduct?.comment"
      :new-price="selectedSaleProduct?.cashSum"
      @submit="update(selectedSaleProduct, $event)"
    />

    <ModalSizesToBucket
      v-model="modalSizesToBucket"
      :sizes="selectedSaleProduct?.sizes"
      :selected="selectedSaleProduct?.sizes"
      :discount-price="selectedSaleProduct?.discount"
      :percentage-discount="selectedSaleProduct?.percentageDiscount"
      :type-sizes="selectedSaleProduct?.product?.typeSize?.list || []"
      :cash-sum="selectedSaleProduct?.cashSum"
      :card-sum="selectedSaleProduct?.cardSum"
      :pay-cash="selectedSaleProduct?.payCash"
      :pay-card="selectedSaleProduct?.payCard"
      :comment="selectedSaleProduct?.comment"
      :new-price="selectedSaleProduct?.cashSum"
      use-for-sale
      @submit="update(selectedSaleProduct, $event)"
    />

    <ImagePreviewDialog
      v-model="imagePreviewDialog"
      :image-src="imagePreview"
    />
  </q-page>
</template>

<script setup>
import moment from 'moment'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import useHelpers from 'src/modules/useHelpers'
import useHistory from 'src/modules/useHistory'
import useSklads from 'src/modules/useSklads'
import useBucket from 'src/modules/useBucket'
import useProfile from 'src/modules/useProfile'
import {
  ref,
  watch
} from 'vue'
import {
  FILTER_FORMAT,
  HISTORY_SOLD
} from 'src/config'
import BucketGrid from 'src/components/Bucket/BucketGrid.vue'
import BucketTable from 'src/components/Bucket/BucketTable.vue'
import PageTitle from 'src/components/PageTitle.vue'
import ModalCountToBucket from 'src/components/Dialogs/ModalCountToBucket.vue'
import ModalSizesToBucket from 'src/components/Dialogs/ModalSizesToBucket.vue'
import ImagePreviewDialog from 'src/components/ImagePreviewDialog.vue'
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_ACTIVITY,
  UPDATE_PRODUCT,
  UPDATE_SALE_PRODUCT,
  DELETE_SALE_PRODUCT
} from 'src/graphql/types'

defineOptions({
  name: 'BucketPage'
})

const VIEW_TABLE = 'table'
const VIEW_GRID = 'grid'

const TODAY = Date.now()
const $q = useQuasar()
const { t: $t } = useI18n()
const { showSuccess, showError } = useHelpers()
const { sklads } = useSklads()
const { profile } = useProfile()
const {
  loadBucketProducts,
  forceRefreshBucket,
  bucketProductsLoading,
  bucketProducts
} = useBucket()
const {
  createHistory
} = useHistory()

const {
  mutate: deleteSaleProduct,
  error: deleteSaleProductError,
} = useMutation(DELETE_SALE_PRODUCT)
const {
  mutate: updateProduct,
  error: updateProductError,
} = useMutation(UPDATE_PRODUCT)
const {
  mutate: updateSaleProduct,
} = useMutation(UPDATE_SALE_PRODUCT)
const {
  mutate: createActivity,
} = useMutation(CREATE_ACTIVITY)

const isLoading = ref(false)
const selectedProduct = ref(null)
const selectedSaleProduct = ref(null)
const checkedSaleProducts = ref([])
const imagePreviewDialog = ref(false)
const imagePreview = ref(null)
const modalCountToBucket = ref(false)
const modalSizesToBucket = ref(false)

// View mode toggle (grid/table)
const viewMode = ref(localStorage.getItem('bucket-view-mode') || VIEW_TABLE)

function removeItemOnce(arr, value) {
  const index = arr.map(s => s.size).indexOf(value.size)
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

async function update(selectedItem, newData) {
  selectedProduct.value = newData
  const allSizes = [...selectedItem.sizes]
  if (newData?.sizes?.length) {
    newData.sizes.forEach(ps => {
      if (allSizes.some(s => s.size === ps.size)) {
        removeItemOnce(allSizes, ps)
      }
    });
  }
  const newSizes = [...allSizes, ...selectedItem.product.sizes]
  await updateProduct({
    id: selectedItem.product.id,
    data: {
      sizes: newSizes.map(ns => ({ size: ns.size })),
      countSizes: selectedItem.product.countSizes + (selectedItem.countSizes - newData.countSizes)
    }
  })
  if (!updateProductError.value) {
    await updateSaleProduct({
      id: selectedItem.id,
      data: {
        discount: newData.discount,
        percentageDiscount: newData.percentageDiscount,
        sizes: newData?.sizes?.map(s => ({
          size: s.size,
        })),
        countSizes: newData.countSizes,
        payCard: newData.payCard,
        payCash: newData.payCash,
        cashSum: newData.cashSum,
        cardSum: newData.cardSum,
        comment: newData.comment,
      }
    })
    await forceRefreshBucket()
    showSuccess($t('bucket.updateBasket'))
  } else {
    showError($t('bucket.errorUpdate'))
  }
  selectedProduct.value = null
}

async function remove(product, payload) {
  isLoading.value = true
  const newSizes = [...product.sizes, ...payload?.sizes || []]
  await updateProduct({
    id: product.id,
    data: {
      sizes: newSizes.map(ns => ({ size: ns.size })),
      countSizes: product.countSizes + payload.countSizes
    }
  })
  await deleteSaleProduct({
    id: payload.id,
  })
  if (!deleteSaleProductError.value) {
    await forceRefreshBucket()
    showSuccess($t('bucket.returnedToWarehouse'))
  } else {
    showError($t('bucket.errorReturn'))
  }
  isLoading.value = false
}

function onChecked(product) {
  if (product.checked) {
    checkedSaleProducts.value.push(product)
  } else {
    checkedSaleProducts.value = checkedSaleProducts.value.filter(cp => cp.id !== product.id)
  }
}

function onUpdateCheckedSaleProducts(products) {
  checkedSaleProducts.value = products
}

function onOpenImagePreview(url) {
  imagePreview.value = url
  imagePreviewDialog.value = true
}

function toggleViewMode() {
  viewMode.value = viewMode.value === VIEW_GRID ? VIEW_TABLE : VIEW_GRID
}

function onOpenModalCountToBucket(saleProduct) {
  selectedSaleProduct.value = saleProduct
  modalCountToBucket.value = true
}

function onOpenModalSizesToBucket(saleProduct) {
  selectedSaleProduct.value = saleProduct
  modalSizesToBucket.value = true
}

function getNewPrice(product) {
  const isDiscountToday = product?.discountDays?.some(d => d === moment(TODAY).format(FILTER_FORMAT))
  if (isDiscountToday && product?.withDiscount) {
    return product?.discountPrice
  }
  return product?.newPrice
}

function toSell() {
  $q.dialog({
    title: $t('common.areYouSure'),
    message: $t('bucket.sellSelectedProducts'),
    cancel: true,
    persistent: true,
    ok: {
      color: 'primary',
      label: $t('bucket.sell'),
      push: true,
    },
    cancel: {
      color: 'white',
      textColor: 'black', 
      label: $t('common.cancel'),
      push: true
    }
  }).onOk(async () => {
    try {
      isLoading.value = true
      for (const saleProduct of checkedSaleProducts.value) {
        const sizes = saleProduct.sizes?.map(s => s.size)
        createHistory({
          userId: +profile.value?.id || null,
          skladId: +saleProduct?.sklad?.id || null,
          productId: +saleProduct?.product?.id || null,
          skladName: saleProduct?.sklad?.name || null,
          telegramId: +profile.value?.telegramId || null,
          fullname: profile.value?.fullname,
          email: profile.value?.email,
          json: {
            sizes,
            countSizes: saleProduct.countSizes,
            name: saleProduct.product.name,
          },
          action: HISTORY_SOLD,
        })
        createActivity({
          data: {
            sklad: saleProduct.sklad.id,
            name: saleProduct.product.name,
            origPrice: saleProduct.product.origPrice,
            newPrice: getNewPrice(saleProduct.product),
            size: (saleProduct.sizes.map(s => s.size)).join(', '),
            discount: saleProduct.discount,
            percentageDiscount: saleProduct.percentageDiscount,
            product: saleProduct.product.id,
            countSizes: saleProduct.countSizes
          }
        })
        await deleteSaleProduct({
          id: saleProduct.id,
        })
      }
      if (!updateProductError.value) {
        await forceRefreshBucket()
        showSuccess($t('bucket.soldSuccessfully'))
      } else {
        showError($t('bucket.errorSell'))
      }
    } finally {
      isLoading.value = false
    }
  })
}

async function checkRemovedProduct(list) {
  const forRemove = list.filter(p => !p.product)
  if (forRemove?.length) {
    for (const p of forRemove) {
      await deleteSaleProduct({
        id: p.id,
      })
    }
    await forceRefreshBucket()
  }
}

watch(bucketProducts, async (newList) => {
  if (newList?.length) {
    checkedSaleProducts.value = newList
    checkRemovedProduct(newList)
  }
}, { immediate: true })

watch(viewMode, (newValue) => {
  localStorage.setItem('bucket-view-mode', newValue)
})

watch(sklads, (val) => {
  if (val?.length) {
    loadBucketProducts(
      null,
      {
        where: {
          sklad: val?.map(s => s.id)
        }
      },
      { fetchPolicy: 'network-only' }
    )
  }
}, {
  immediate: true
})
</script>

<style lang="scss" scoped></style>
