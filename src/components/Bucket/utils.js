export function getTotalSum(bucketProduct) {
  // Get base values with fallbacks to prevent NaN
  const basePrice = bucketProduct.cashSum || 0
  const itemCount = bucketProduct.product?.useNumberOfSizes 
    ? (bucketProduct.countSizes || 0) 
    : (bucketProduct.sizes?.length || 0)
  const discountValue = bucketProduct.discount || 0
  
  // Calculate base total
  const baseTotal = basePrice * itemCount
  
  // Apply discount based on type
  let finalTotal = baseTotal
  if (discountValue > 0) {
    if (bucketProduct.percentageDiscount) {
      // Apply percentage discount
      finalTotal = baseTotal * (1 - discountValue / 100)
    } else {
      // Apply flat amount discount
      finalTotal = baseTotal - discountValue
    }
  }
  
  // Ensure total is never negative
  return Math.max(0, finalTotal)
}
