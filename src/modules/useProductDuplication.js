import { ref } from 'vue'
import { useRouter } from 'vue-router'

const DUPLICATE_DATA_KEY = 'duplicateProductData'
const DUPLICATED_FROM_ID_KEY = 'duplicatedFromID'

export default function useProductDuplication() {
  const router = useRouter()
  const isDuplicating = ref(false)
  const duplicatedFromID = ref('')

  /**
   * Saves product data for duplication in localStorage
   * @param {Object} product - product object for duplication
   */
  function saveProductForDuplication(product) {
    const productData = {
      sklad: product.sklad,
      category: product.category,
      name: `${product.name} (copy)`,
      origPrice: product.origPrice,
      newPrice: product.newPrice,
      discountPrice: product.discountPrice,
      discountDays: product.discountDays,
      withDiscount: product.withDiscount,
      color: product.color,
      colorName: product.colorName,
      sizes: [...product.sizes],
      countSizes: product.countSizes,
      useNumberOfSizes: product.useNumberOfSizes,
      image: product.image,
      imageId: product.imageId,
      typeSize: {
        id: product.typeSize?.id,
      },
      prices: [...(product.prices || [])]
    }
    
    localStorage.setItem(DUPLICATE_DATA_KEY, JSON.stringify(productData))
    localStorage.setItem(DUPLICATED_FROM_ID_KEY, product.id)
  }

  /**
   * Loads duplication data from localStorage
   * @returns {Object|null} product data for duplication or null
   */
  function loadDuplicateData() {
    const duplicateData = localStorage.getItem(DUPLICATE_DATA_KEY)
    const duplicatedName = localStorage.getItem(DUPLICATED_FROM_ID_KEY)
    
    if (duplicateData) {
      isDuplicating.value = true
      duplicatedFromID.value = duplicatedName || ''
      return JSON.parse(duplicateData)
    }
    
    return null
  }

  /**
   * Clears duplication data from localStorage
   */
  function clearDuplicateData() {
    localStorage.removeItem(DUPLICATE_DATA_KEY)
    localStorage.removeItem(DUPLICATED_FROM_ID_KEY)
    isDuplicating.value = false
    duplicatedFromID.value = ''
  }

  /**
   * Starts the product duplication process
   * @param {Object} product - product for duplication
   */
  function duplicateProduct(product) {
    saveProductForDuplication(product)
    router.push('/create-product')
  }

  /**
   * Applies duplication data to product object
   * @param {Object} product - product object to apply data to
   * @param {Object} duplicateData - data for duplication
   */
  function applyDuplicateData(product, duplicateData) {
    if (duplicateData) {
      Object.assign(product, duplicateData)
      isDuplicating.value = true
      duplicatedFromID.value = localStorage.getItem(DUPLICATED_FROM_ID_KEY) || ''
    }
  }

  return {
    isDuplicating,
    duplicatedFromID,
    saveProductForDuplication,
    loadDuplicateData,
    clearDuplicateData,
    duplicateProduct,
    applyDuplicateData
  }
} 