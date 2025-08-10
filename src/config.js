export const HISTORY_ACTIONS_COLORS = {
  create: '#00FF00',
  update: '#FFFF00',
  delete: '#FF0000',
  sold: '#0000FF',
  return: '#FF0000'
}
export const HISTORY_CREATE = 'create'
export const HISTORY_UPDATE = 'update'
export const HISTORY_DELETE = 'delete'
export const HISTORY_SOLD = 'sold'
export const HISTORY_RETURN = 'return'

export const MAIN_COLOR_DARK = '#222831'
export const MAIN_COLOR_LIGHT = '#f7f7f7'
export const COLOR_ERROR = 'red-4'
export const COLOR_SUCCESS = 'green-4'

export const TOKEN_ACCESS_NAME = 'access_token'
export const TOKEN_REFRESH_NAME = 'refresh_token'
export const TOKEN_TYPE = 'Bearer'

// Roles
export const ROLE_EMPLOYEE = 'employee'
export const ROLE_ADMIN = 'admin'

// Date formats
export const FILTER_FORMAT = 'YYYY-MM-DD'
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ssZ'
export const DISPLAY_FORMAT = 'YYYY-MM-DD HH:mm'
export const DATEPICKER_FORMAT = 'YYYY/MM/DD'
export const DAY = 'day'
export const WEEK = 'week'
export const MONTH = 'month'
export const YEAR = 'year'

// Accent colors
export const ACCENT_COLORS = [
  { name: 'default', value: '#BCA37F', rgb: '188, 163, 127' },
  { name: 'emerald', value: '#6B8E74', rgb: '107, 142, 116' },
  { name: 'amethyst', value: '#9B7BB8', rgb: '155, 123, 184' },
  { name: 'terracotta', value: '#C65D7B', rgb: '198, 93, 123' },
  { name: 'indigo', value: '#5A6FA8', rgb: '90, 111, 168' },

]

// Localstorage keys
export const SKLAD_DRAFT_KEY = 'sklad-draft-product'
export const I18N_LOCALE = 'sklad_i18n_locale'
export const IS_DARK_MODE = 'sklad_is_dark_mode'
export const SKLAD_PWA_INSTALLED = 'sklad_pwa_installed'
export const ACCENT_COLOR = 'sklad_accent_color'

// Telegram
export const DEV_TG_INIT_DATA_UNSAFE = process.env.DEV_TG_INIT_DATA_UNSAFE

// LINKS
export const CONNECT_GOOGLE = `${process.env.API_URL}/connect/google`

export const PAGINATION_LIMIT = 20
