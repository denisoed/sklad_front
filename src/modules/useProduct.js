import { computed, watch } from 'vue'
import { useMutation, useLazyQuery } from '@vue/apollo-composable'
import {
  DELETE_PRODUCT,
  DELETE_FILE,
  UPDATE_PRODUCT,
  ADD_PRODUCT_SIZES_TO_SALE,
  PRODUCTS_WITH_MIN_SIZES,
  SEARCH_PRODUCTS
} from 'src/graphql/types'
import { apolloClient } from 'src/boot/apollo'
import { HISTORY_DELETE } from 'src/config'
import { useRoute } from 'vue-router'
import useHelpers from 'src/modules/useHelpers'
import useHistory from 'src/modules/useHistory'
import { useProductsStore } from 'src/stores/products'
import { useBucketStore } from 'src/stores/bucket'

const useProduct = () => {
  const { showError, showSuccess } = useHelpers()
  const { params } = useRoute()
  const productsStore = useProductsStore()
  const bucketStore = useBucketStore()
  const {
    createHistory,
  } = useHistory()
  const {
    result: productsWithMinSizes,
    load: loadProductsWithMinSizes,
    refetch: refetchProductsWithMinSizes
  } = useLazyQuery(PRODUCTS_WITH_MIN_SIZES)
  const {
    error: updateProductError,
    loading: updateProductLoading,
    mutate: updateProduct
  } = useMutation(UPDATE_PRODUCT)
  const {
    error: saleProductError,
    loading: saleProductLoading,
    mutate: addProductSizesToSale
  } = useMutation(ADD_PRODUCT_SIZES_TO_SALE)
  const {
    mutate: removeImage,
    loading: removeImageLoading,
  } = useMutation(DELETE_FILE)
  const {
    mutate: deleteProduct,
    error: deleteProductError,
    loading: removeProductLoading,
  } = useMutation(DELETE_PRODUCT)

  async function addCountToBucket(p, payload) {
    if (!payload.countSizes) return
    await updateProduct({
      id: p.id,
      data: {
        countSizes: p.countSizes - payload.countSizes,
      }
    })
    if (!updateProductError.value) {
      await addProductSizesToSale({
        input: {
          skladId: p.sklad.id,
          productId: p.id,
          discount: payload.discount,
          percentageDiscount: payload.percentageDiscount,
          countSizes: payload.countSizes,
          payCash: payload.payCash,
          payCard: payload.payCard,
          cashSum: payload.cashSum,
          cardSum: payload.cardSum,
          comment: payload.comment,
        }
      })
      if (!saleProductError.value) {
        showSuccess('Товар добавлен в корзину!')
        // Update bucket count in store immediately
        bucketStore.setBucketProductsCount(bucketStore.getBucketProductsCount + 1)
      }
    } else {
      showError('Не удалось добавить в корзину. Попробуйте позже.')
    }
  }

  async function addSizesToBucket(p, payload) {
    if (!payload.sizes.length) return
    const newSizes = p.sizes.filter(s => !payload.sizes.some(ps => ps === s.id))
    const sizesForSale = p.sizes.filter(s => payload.sizes.some(ps => ps === s.id))
    await updateProduct({
      id: p.id,
      data: {
        sizes: newSizes.map(ns => ({ size: ns.size })),
      }
    })
    if (!updateProductError.value) {
      await addProductSizesToSale({
        input: {
          skladId: p.sklad.id,
          productId: p.id,
          discount: payload.discount,
          percentageDiscount: payload.percentageDiscount,
          sizes: sizesForSale.map(sfs => ({ size: sfs.size })),
          payCash: payload.payCash,
          payCard: payload.payCard,
          cashSum: payload.cashSum,
          cardSum: payload.cardSum,
          comment: payload.comment,
        }
      })
      if (!saleProductError.value) {
        showSuccess('Товар добавлен в корзину!')
        // Update bucket count in store immediately
        bucketStore.setBucketProductsCount(bucketStore.getBucketProductsCount + 1)
      }
    } else {
      showError('Не удалось добавить в корзину. Попробуйте позже.')
    }
  }

  async function removeProduct(id, product) {
    const { data } = await deleteProduct({ id })
    if (!deleteProductError.value) {
      const imageId = data?.deleteProduct?.product?.image?.id
      if (imageId) removeImage({ id: imageId })
      createHistory({
        action: HISTORY_DELETE,
        productId: product.id,
        skladId: product.sklad.value,
        json: {
          name: product.name,
          origPrice: product.origPrice,
          newPrice: product.newPrice,
          sizes: product.sizes.map(s => s.size),
          countSizes: product.countSizes
        }
      })
    } else {
      showError('Не удалось удалить продукт. Проблемы на сервере.')
    }
  }

  function generateProductMeta(product) {
    return `
      ${`Склад=${product.sklad?.label}`},
      ${`Категория=${product.category?.label}`},
      ${`Название=${product.name}`},
      ${`Цвет=${product.colorName}`},
      ${product.sizes.length ? `Размеры=${product.sizes.map(s => s.size).join(', ')},` : ''}
      ${product.useNumberOfSizes ? `Количество=${product.countSizes},` : ''}
      ${product.withDiscount ? `Скидка=${product.discountPrice},` : ''}
      ${`Оптовая цена=${product.origPrice}`},
      ${`Розничная цена=${product.newPrice}`},
    `.trim()
  }

  async function updateProductById(id, data) {
    await updateProduct({
      id,
      data: {
        sklad: params?.skladId,
        ...data,
      }
    })  
  }

  async function searchProducts({ q = null, where = {}, sizes = null }) {
    try {
      isLoading.value = true;
      const { data } = await apolloClient.query({
        query: SEARCH_PRODUCTS,
        variables: {
          ...(q ? { q } : {}),
          where,
          sizes
        },
        fetchPolicy: 'network-only'
      })
      productsStore.setProducts(data?.search)
      return data?.search;
    } catch (error) {
      console.log(error);
      showError('Неизвестная ошибка. Перегрузите приложение!')
    } finally {
      isLoading.value = false;
    }
  }

  const products = computed(() => productsStore.getProducts)

  const isLoading = computed(
    () => updateProductLoading ||
    saleProductLoading ||
    removeProductLoading ||
    removeImageLoading
  )

  watch(productsWithMinSizes, (newValue) => {
    if (newValue) {
      productsStore.setProductsWithMinSizes(newValue)
    }
  })

  return {
    addSizesToBucket,
    addCountToBucket,
    removeProduct,
    generateProductMeta,
    updateProductById,
    updateProductError,
    updateProductLoading,
    isLoading,
    loadProductsWithMinSizes,
    refetchProductsWithMinSizes,
    searchProducts,
    products
  }
}

export default useProduct
