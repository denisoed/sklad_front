import { computed, watch, ref } from 'vue'
import { useMutation, useLazyQuery } from '@vue/apollo-composable'
import {
  DELETE_PRODUCT,
  DELETE_FILE,
  UPDATE_PRODUCT,
  ADD_PRODUCT_SIZES_TO_SALE,
  PRODUCTS_WITH_MIN_SIZES,
  SEARCH_PRODUCTS,
  CREATE_PRODUCT
} from 'src/graphql/types'
import { apolloClient } from 'src/boot/apollo'
import { HISTORY_DELETE, HISTORY_UPDATE, HISTORY_CREATE } from 'src/config'
import { useRoute } from 'vue-router'
import useHelpers from 'src/modules/useHelpers'
import useHistory from 'src/modules/useHistory'
import { useProductsStore } from 'src/stores/products'
import { useBucketStore } from 'src/stores/bucket'
import useProductHistory from 'src/modules/useProductHistory'

const useProduct = () => {
  const { showError, showSuccess } = useHelpers()
  const { params } = useRoute()
  const productsStore = useProductsStore()
  const bucketStore = useBucketStore()
  const {
    createProductHistory,
    createUpdateHistory,
    createDeleteHistory
  } = useProductHistory()
  const {
    createHistory,
  } = useHistory()
  const {
    result: productsWithMinSizes,
    load: loadProductsWithMinSizes,
    refetch: refetchProductsWithMinSizes
  } = useLazyQuery(PRODUCTS_WITH_MIN_SIZES)
  const {
  mutate: createProduct,
  error: createProductError,
  loading: createProductLoading
} = useMutation(CREATE_PRODUCT)
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

  const searchLoading = ref(false)

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
      const deletedProduct = data?.deleteProduct?.product
      const imageId = deletedProduct?.image?.id
      const duplicateFromImageId = deletedProduct?.duplicateFrom?.image?.id
      
      // Check if this is a duplicate product (has duplicateFrom field)
      // If it's a duplicate, don't delete the image as it's shared with the original product
      // But if the duplicate has a different image than the original, delete it
      if (imageId && !duplicateFromImageId) {
        // Not a duplicate - delete the image
        removeImage({ id: imageId })
      } else if (imageId && duplicateFromImageId && duplicateFromImageId !== imageId) {
        // This is a duplicate with a modified image - delete the modified image
        removeImage({ id: imageId })
      }
      
      createDeleteHistory(product, id, product.sklad.id)
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

  async function createNewProduct(data) {
    const { data: response } = await createProduct({
      data
    })
    if (!createProductError.value) {
      createProductHistory(data, response.createProduct.product.id, data?.sklad)
    }
    return response?.createProduct?.product
  }

  async function updateProductById(id, newData, oldData) {
    await updateProduct({
      id,
      data: newData
    })
    if (!updateProductError.value && oldData) {
      createUpdateHistory(oldData, newData, id, oldData?.sklad?.id)
    }
  }

  async function searchProducts({ q = null, where = {}, sizes = null }) {
    try {
      searchLoading.value = true
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
      searchLoading.value = false
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
    products,
    searchLoading,
    createNewProduct,
    createProductError,
    createProductLoading
  }
}

export default useProduct
