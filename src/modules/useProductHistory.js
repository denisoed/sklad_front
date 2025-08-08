import { HISTORY_UPDATE, HISTORY_CREATE, HISTORY_DELETE } from 'src/config'
import useHistory from './useHistory'
import useHelpers from './useHelpers'

export default function useProductHistory() {
  const { createHistory, history } = useHistory()
  const { difference } = useHelpers()

  /**
   * Создает запись в истории для создания товара
   * @param {Object} product - созданный товар
   * @param {string} productId - ID товара
   * @param {string} skladId - ID склада
   */
  function createProductHistory(product, productId, skladId) {
    createHistory({
      action: HISTORY_CREATE,
      productId,
      skladId,
      json: {
        name: product.name,
        origPrice: product.origPrice,
        newPrice: product.newPrice,
        sizes: product.sizes.map(s => s.size),
        countSizes: product.countSizes
      }
    })
  }

  /**
   * Создает записи в истории для обновления товара
   * @param {Object} oldData - старые данные товара
   * @param {Object} newData - новые данные товара
   * @param {string} productId - ID товара
   * @param {string} skladId - ID склада
   */
  function createUpdateHistory(oldData, newData, productId, skladId) {
    const fields = []

    // Проверяем изменения в названии
    if (oldData.name !== newData.name) {
      fields.push({
        name: oldData.name,
        old: oldData.name,
        new: newData.name,
        type: 'name'
      })
    }

    // Проверяем изменения в цвете
    if (oldData.color !== newData.color) {
      fields.push({
        name: oldData.name,
        old: oldData.color,
        new: newData.color,
        type: 'color'
      })
    }

    // Проверяем изменения в оптовой цене
    if (oldData.origPrice !== newData.origPrice) {
      fields.push({
        name: oldData.name,
        old: oldData.origPrice,
        new: newData.origPrice,
        type: 'origPrice'
      })
    }

    // Проверяем изменения в розничной цене
    if (oldData.newPrice !== newData.newPrice) {
      fields.push({
        name: oldData.name,
        old: oldData.newPrice,
        new: newData.newPrice,
        type: 'newPrice'
      })
    }

    // Проверяем изменения в количестве размеров
    if (oldData.countSizes !== newData.countSizes) {
      fields.push({
        name: oldData.name,
        old: oldData.countSizes,
        new: newData.countSizes,
        type: 'countSizes'
      })
    }

    // Проверяем изменения в размерах
    const oldSizes = oldData.sizes.map(s => s.size)
    const newSizes = newData.sizes.map(s => s.size)
    
    if (JSON.stringify(oldSizes) !== JSON.stringify(newSizes)) {
      if (oldSizes.length > newSizes.length) {
        const removedSizes = difference(oldSizes, newSizes)
        fields.push({
          name: oldData.name,
          sizes: removedSizes,
          type: 'removedSizes'
        })
      }
      
      if (oldSizes.length < newSizes.length) {
        const addedSizes = difference(newSizes, oldSizes)
        fields.push({
          name: oldData.name,
          sizes: addedSizes,
          type: 'addedSizes'
        })
      }
    }

    // Создаем записи в истории для каждого изменения
    fields.forEach(field => {
      createHistory({
        action: HISTORY_UPDATE,
        productId,
        skladId,
        json: field
      })
    })
  }

  /**
   * Создает запись в истории для удаления товара
   * @param {Object} product - удаленный товар
   * @param {string} skladId - ID склада
   */
  function createDeleteHistory(product, productId, skladId) {
    createHistory({
      action: HISTORY_DELETE,
      productId,
      skladId,
      json: {
        name: product.name,
        origPrice: product.origPrice,
        newPrice: product.newPrice,
        sizes: product.sizes.map(s => s.size),
        countSizes: product.countSizes
      },
    })
  }

  return {
    createProductHistory,
    createUpdateHistory,
    createDeleteHistory
  }
} 