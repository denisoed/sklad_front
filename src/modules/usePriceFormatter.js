/**
 * Utility module for price formatting
 */

export const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') {
    return 'n/a'
  }
  
  const priceNum = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(priceNum)) {
    return 'n/a'
  }
  
  return priceNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default {
  formatPrice
} 