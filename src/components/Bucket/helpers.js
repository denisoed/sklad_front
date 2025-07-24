import moment from 'moment'
import { FILTER_FORMAT } from 'src/config'

const TODAY = Date.now()

export function getNewPrice(product, payCash, payCard, cashSum, cardSum, percentageDiscount, discount) {
  let newPrice = product?.newPrice
  const isDiscountToday = product?.discountDays?.some(d => d === moment(TODAY).format(FILTER_FORMAT))
  if (isDiscountToday && product?.withDiscount) {
    newPrice = product?.discountPrice
  }

  let sum = 0;
  if (payCash && payCard) {
    sum = ((cashSum || 0) + (cardSum || 0))
  } else {
    sum = newPrice
  }
  return percentageDiscount ?
    sum - ((sum / 100) * discount) :
      sum - discount;
}
