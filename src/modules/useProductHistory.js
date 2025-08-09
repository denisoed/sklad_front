import { HISTORY_UPDATE, HISTORY_CREATE, HISTORY_DELETE } from 'src/config'
import useHistory from './useHistory'
import useHelpers from './useHelpers'
import useProfile from './useProfile'

export default function useProductHistory() {
  const { profile } = useProfile()
  const { createHistory } = useHistory()
  const { difference } = useHelpers()

  /**
   * Creates a history entry for product creation
   * @param {Object} product - created product
   * @param {string} productId - product ID
   * @param {Object} sklad - warehouse
   */
  function createProductHistory(product, productId, sklad) {
    createHistory({
      productId: +productId || null,
      userId: +profile.value?.id || null,
      skladId: +sklad?.id || null,
      telegramId: +profile.value?.telegramId || null,
      action: HISTORY_CREATE,
      skladName: sklad?.name,
      fullname: profile.value?.fullname,
      email: profile.value?.email,
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
   * Creates history entries for product update
   * @param {Object} oldData - old product data
   * @param {Object} newData - new product data
   * @param {string} productId - product ID
   * @param {Object} sklad - warehouse
   */
  function createUpdateHistory(oldData, newData, productId, sklad) {
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
        productId: +productId || null,
        skladId: +sklad?.id || null,
        userId: +profile.value?.id || null,
        telegramId: +profile.value?.telegramId || null,
        skladName: sklad?.name,
        action: HISTORY_UPDATE,
        fullname: profile.value?.fullname,
        email: profile.value?.email,
        json: field
      })
    })
  }

  /**
   * Creates a history entry for product deletion
   * @param {Object} product - deleted product
   * @param {string} productId - product ID
   * @param {Object} sklad - warehouse
   */
  function createDeleteHistory(product, productId, sklad) {
    createHistory({
      productId: +productId || null,
      skladId: +sklad?.id || null,
      userId: +profile.value?.id || null,
      telegramId: +profile.value?.telegramId || null,
      action: HISTORY_DELETE,
      skladName: sklad?.name,
      fullname: profile.value?.fullname,
      email: profile.value?.email,
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