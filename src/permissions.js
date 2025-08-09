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
  { val: READ_HISTORY, description: 'Sees History page' },
  { val: READ_SETTINGS, description: 'Sees Settings page' },
  { val: READ_COST, description: 'Sees Costs page' },
  { val: READ_STATISTIC, description: 'Sees Reports page' },
  { val: READ_ORIGINAL_PRICE, description: 'Sees wholesale price' },
  { val: READ_PRODUCTS_WITH_MIN_SIZES, description: 'Sees Stock page' },
  { val: READ_NET_PRICE, description: 'Отчеты: блок Чистый доход' },
  { val: READ_STATISTIC_TABLE_ACTIONS, description: 'Отчеты: кнопки управления в таблице' },
  { val: READ_STATISTIC_FINANCE, description: 'Отчеты: блок Финансы' },
  { val: READ_CATEGORIES, description: 'Видит страницу Категории' },
  { val: CAN_REMOVE_PRODUCT, description: 'Удалять товар' },
  { val: CAN_SELL_PRODUCT, description: 'Продавать товар' },
  { val: CAN_ADD_PRODUCT, description: 'Добавлять товар' },
  { val: CAN_UPDATE_PRODUCT, description: 'Обновлять товар' },
  { val: CAN_ADD_COST, description: 'Добавлять расходы' },
  { val: CAN_ADD_CATEGORY, description: 'Добавлять категории' },
  { val: CAN_UPDATE_CATEGORY, description: 'Обновлять категории' },
]
