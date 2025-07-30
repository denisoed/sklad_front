<template>
  <q-page>
    <div class="container">
      <PageTitle title="Товаровы на продажу">
        <div>
          <q-card-section class="q-pt-none text-primary">
            На этой странице отображаются товары выбранные для продажи.
          </q-card-section>
        </div>
      </PageTitle>

      <div v-if="bucketProducts && bucketProducts.length">
        <div class="flex items-center justify-between q-mb-sm">
          <div class="flex items-center q-gap-sm">
            <p class="q-mb-none text-subtitle2">Заказы</p>
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
      </div>
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
          Загрузка...
        </span>
        <span
          v-else
        >
          <q-icon
            size="sm"
            name="mdi-cart-outline"
            class="q-mr-sm text-grey-5"
          />
          Корзина пуста
        </span>
      </h6>
      <div class="flex flex-center q-mt-lg">
        <q-btn
          v-if="bucketProducts?.length"
          label="Продать товары"
          push
          color="primary"
          @click="toSell"
          :loading="isLoading"
          :disable="bucketProducts && !bucketProducts.length"
        />
        <q-btn
          v-else
          label="Добавить товары в корзину"
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
  </q-page>
</template>

<script setup>
import moment from 'moment'
import { useQuasar } from 'quasar'
import useHelpers from 'src/modules/useHelpers'
import useHistory from 'src/modules/useHistory'
import useSklads from 'src/modules/useSklads'
import useBucket from 'src/modules/useBucket'
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
const { showSuccess, showError } = useHelpers()
const { sklads } = useSklads()
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
const viewMode = ref(localStorage.getItem('bucket-view-mode') || VIEW_GRID)

async function update(selectedItem, newData) {
  selectedProduct.value = newData
  const allSizes = [...selectedItem.sizes]
  if (newData?.sizes?.length) {
    newData.sizes.forEach(ps => {
      if (allSizes.some(s => s.size === ps.size)) {
        removeselectedItemOnce(allSizes, ps)
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
    showSuccess('Корзина обновлена')
  } else {
    showError('Не удалось обновить продукт. Попробуйте позже.')
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
    showSuccess('Товар возвращен на склад')
  } else {
    showError('Не удалось вернуть товар на склад. Попробуйте позже.')
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
    title: 'Вы уверены?',
    message: 'Продать выбранные товары',
    cancel: true,
    persistent: true,
    ok: {
      color: 'primary',
      label: 'Продать',
      push: true,
    },
    cancel: {
      color: 'white',
      textColor: 'black', 
      label: 'Отмена',
      push: true
    }
  }).onOk(async () => {
    try {
      isLoading.value = true
      for (const saleProduct of checkedSaleProducts.value) {
        const sizes = saleProduct.sizes?.map(s => s.size)
        createHistory({
          skladId: saleProduct.sklad.id,
          productId: saleProduct.product.id,
          json: { sizes, countSizes: saleProduct.countSizes },
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
        showSuccess('Товары успешно проданы!')
      } else {
        showError('Произошла ошибка. Попробуйте позже.')
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
