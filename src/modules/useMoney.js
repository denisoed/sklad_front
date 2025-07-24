const useMoney = () => {
  const formatter = new Intl.NumberFormat('en-US', {
    currency: 'USD',
  })
  
  function formatPrice(money, currency) {
    if (!money) return 0
    return `${formatter.format(money)}${currency || ''}`.replace(',', ' ')
  }

  function unformat(money, currency) {
    if (!currency) return money
    const withoutCurrency = String(money)?.replace(currency, '')
    const num = +withoutCurrency.replace(/ /g, '')
    return isNaN(num) ? 0 : num
  }

  return {
    formatPrice,
    unformat
  }
}

export default useMoney
