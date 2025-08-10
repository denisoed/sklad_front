export const READ_HISTORY = 'read:history'
export const READ_SETTINGS = 'read:settings'
export const READ_COST = 'read:cost'
export const READ_STATISTIC = 'read:statistic'
export const READ_ORIGINAL_PRICE = 'read:original.price'
export const READ_NET_PRICE = 'read:net.price'
export const READ_PRODUCTS_WITH_MIN_SIZES = 'read:products.with.min.sizes'
export const READ_STATISTIC_TABLE_ACTIONS = 'read:statistic.table.actions'
export const READ_STATISTIC_FINANCE = 'read:statistic.finance'
export const READ_CATEGORIES = 'read:categories'
export const CAN_REMOVE_PRODUCT = 'can:remove.product'
export const CAN_SELL_PRODUCT = 'can:sell.product'
export const CAN_ADD_PRODUCT = 'can:add.product'
export const CAN_UPDATE_PRODUCT = 'can:update.product'
export const CAN_ADD_COST = 'can:add.cost'
export const CAN_ADD_CATEGORY = 'can:add.category'
export const CAN_UPDATE_CATEGORY = 'can:update.category' // Not used

export const ALL_PERMISSIONS = [
  READ_HISTORY,
  READ_SETTINGS,
  READ_COST,
  READ_STATISTIC,
  READ_ORIGINAL_PRICE,
  READ_NET_PRICE,
  READ_PRODUCTS_WITH_MIN_SIZES,
  READ_STATISTIC_TABLE_ACTIONS,
  READ_STATISTIC_FINANCE,
  CAN_REMOVE_PRODUCT,
  CAN_SELL_PRODUCT,
  CAN_ADD_PRODUCT,
  CAN_UPDATE_PRODUCT,
  CAN_ADD_COST,
  CAN_ADD_CATEGORY,
  CAN_UPDATE_CATEGORY,
  READ_CATEGORIES
]

export const ALL_PERMISSIONS_WITH_DESCRIPTION = [
  { val: READ_HISTORY, description: 'permissions.seeHistory' },
  { val: READ_SETTINGS, description: 'permissions.seeSettings' },
  { val: READ_COST, description: 'permissions.seeCosts' },
  { val: READ_STATISTIC, description: 'permissions.seeReports' },
  { val: READ_ORIGINAL_PRICE, description: 'permissions.seeOriginalPrice' },
  { val: READ_PRODUCTS_WITH_MIN_SIZES, description: 'permissions.seeStock' },
  { val: READ_NET_PRICE, description: 'permissions.seeNetPrice' },
  { val: READ_STATISTIC_TABLE_ACTIONS, description: 'permissions.seeStatisticTableActions' },
  { val: READ_STATISTIC_FINANCE, description: 'permissions.seeStatisticFinance' },
  { val: READ_CATEGORIES, description: 'permissions.seeCategories' },
  { val: CAN_REMOVE_PRODUCT, description: 'permissions.canRemoveProduct' },
  { val: CAN_SELL_PRODUCT, description: 'permissions.canSellProduct' },
  { val: CAN_ADD_PRODUCT, description: 'permissions.canAddProduct' },
  { val: CAN_UPDATE_PRODUCT, description: 'permissions.canUpdateProduct' },
  { val: CAN_ADD_COST, description: 'permissions.canAddCost' },
  { val: CAN_ADD_CATEGORY, description: 'permissions.canAddCategory' },
  { val: CAN_UPDATE_CATEGORY, description: 'permissions.canUpdateCategory' },
]
