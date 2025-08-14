// Hints configuration for onboarding tour
// Usage example in templates:
// <button v-tour="'products_add'">Добавить товар</button>
// Or with overrides:
// <button v-tour="{ key: 'products_add', text: 'Нажмите, чтобы добавить товар', position: 'auto' }" />

export const TOUR_STORAGE_PREFIX = 'SKLAD_TOUR_SHOWN_'
export const CREATE_NEW_BUTTON = 'CREATE_NEW_BUTTON'

// Centralized registry of default hints
// Add your keys here to keep texts in one place (can be moved to i18n later)
export const TOUR_HINTS = {
  [CREATE_NEW_BUTTON]: {
    text: '<div class="alert-box">Эта кнопка позволяет создать склад, категорию или товар из любого места в приложении.</div><br> <span>Попробуйте...</span>',
  },
}


