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
        <BucketCard
          v-for="(b, i) of bucketProducts"
          :key="i"
          :id="b.id"
          :product-id="b.product?.id"
          :name="b.product?.name"
          :orig-price="b.product?.origPrice"
          :new-price="getNewPrice(b.product)"
          :color="b.product?.color"
          :image="b.product?.image?.url"
          :sizes="b.sizes"
          :type-sizes="b?.product?.typeSize?.list"
          :discount="b.discount"
          :percentage-discount="b.percentageDiscount"
          :pay-cash="b.payCash"
          :pay-card="b.payCard"
          :card-sum="b.cardSum"
          :cash-sum="b.cashSum"
          :comment="b.comment"
          :loading="b.product?.id === selectedProduct?.id"
          :count-sizes="b.countSizes"
          :sklad="b.sklad"
          :use-number-of-sizes="b.product?.useNumberOfSizes"
          class="q-mb-md"
          @update="update(b, $event)"
          @remove="remove(b.product, $event)"
          @on-checked="onChecked"
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
            name="mdi-basket-outline"
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
  </q-page>
</template>

<script>
import moment from 'moment'
import { useQuasar } from 'quasar'
import useHelpers from 'src/modules/useHelpers'
import useHistory from 'src/modules/useHistory'
import useSklads from 'src/modules/useSklads'
import useBucket from 'src/modules/useBucket'
import {
  defineComponent,
  ref,
  watch
} from 'vue'
import {
  FILTER_FORMAT,
  HISTORY_SOLD
} from 'src/config'
import BucketCard from 'src/components/BucketCard.vue'
import PageTitle from 'src/components/PageTitle.vue'
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_ACTIVITY,
  UPDATE_PRODUCT,
  UPDATE_SALE_PRODUCT,
  DELETE_SALE_PRODUCT
} from 'src/graphql/types'

export default defineComponent({
  name: 'BucketPage',
  components: {
    BucketCard,
    PageTitle,
  },
  setup () {
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
    const checkedSaleProducts = ref([])

    function removeItemOnce(arr, value) {
      const index = arr.map(s => s.size).indexOf(value.size)
      if (index > -1) {
        arr.splice(index, 1)
      }
      return arr
    }

    async function update(item, payload) {
      selectedProduct.value = payload
      const allSizes = [...item.sizes]
      if (payload?.sizes?.length) {
        payload.sizes.forEach(ps => {
          if (allSizes.some(s => s.size === ps.size)) {
            removeItemOnce(allSizes, ps)
          }
        });
      }
      const newSizes = [...allSizes, ...item.product.sizes]
      await updateProduct({
        id: item.product.id,
        data: {
          sizes: newSizes.map(ns => ({ size: ns.size })),
          countSizes: item.product.countSizes + (item.countSizes - payload.countSizes)
        }
      })
      if (!updateProductError.value) {
        await updateSaleProduct({
          id: payload.id,
          data: {
            discount: payload.discount,
            percentageDiscount: payload.percentageDiscount,
            sizes: payload?.sizes?.map(s => ({
              size: s.size,
            })),
            payCard: payload.payCard,
            payCash: payload.payCash,
            cashSum: payload.cashSum,
            cardSum: payload.cardSum,
            comment: payload.comment,
          }
        })
        await forceRefreshBucket()
        showSuccess('Корзина успешно обновлена!')
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
        showSuccess('Товар успешно удален!')
      } else {
        showError('Не удалось удалить продукт. Попробуйте позже.')
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

    return {
      bucketProducts,
      update,
      selectedProduct,
      toSell,
      onChecked,
      isLoading,
      bucketProductsLoading,
      remove,
      getNewPrice
    }
  }
})
</script>

<style lang="scss" scoped></style>
