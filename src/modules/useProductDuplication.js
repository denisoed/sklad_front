import { ref } from 'vue'
import { useRouter } from 'vue-router'

const DUPLICATE_DATA_KEY = 'duplicateProductData'
const DUPLICATED_FROM_ID_KEY = 'duplicatedFromID'

export default function useProductDuplication() {
  const router = useRouter()
  const isDuplicating = ref(false)
  const duplicatedFromID = ref('')

  /**
   * Сохраняет данные товара для дублирования в localStorage
   * @param {Object} product - объект товара для дублирования
   */
  function saveProductForDuplication(product) {
    const productData = {
      sklad: product.sklad,
      category: product.category,
      name: `${product.name} (копия)`,
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
      typeSize: {
        id: product.typeSize?.id,
      },
      prices: [...(product.prices || [])]
    }
    
    localStorage.setItem(DUPLICATE_DATA_KEY, JSON.stringify(productData))
    localStorage.setItem(DUPLICATED_FROM_ID_KEY, product.id)
  }

  /**
   * Загружает данные дублирования из localStorage
   * @returns {Object|null} данные товара для дублирования или null
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
   * Очищает данные дублирования из localStorage
   */
  function clearDuplicateData() {
    localStorage.removeItem(DUPLICATE_DATA_KEY)
    localStorage.removeItem(DUPLICATED_FROM_ID_KEY)
    isDuplicating.value = false
    duplicatedFromID.value = ''
  }

  /**
   * Запускает процесс дублирования товара
   * @param {Object} product - товар для дублирования
   */
  function duplicateProduct(product) {
    saveProductForDuplication(product)
    router.push('/create-product')
  }

  /**
   * Применяет данные дублирования к объекту товара
   * @param {Object} product - объект товара для применения данных
   * @param {Object} duplicateData - данные для дублирования
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