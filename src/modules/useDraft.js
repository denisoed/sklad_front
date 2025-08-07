import { SKLAD_DRAFT_KEY } from 'src/config'

export default function useDraft() {
  /**
   * Сохраняет черновик товара в localStorage
   * @param {Object} product - объект товара для сохранения
   */
  function saveDraft(product) {
    localStorage.setItem(SKLAD_DRAFT_KEY, JSON.stringify(product))
  }

  /**
   * Загружает черновик товара из localStorage
   * @returns {Object|null} черновик товара или null
   */
  function loadDraft() {
    const draft = localStorage.getItem(SKLAD_DRAFT_KEY)
    return draft ? JSON.parse(draft) : null
  }

  /**
   * Очищает черновик товара из localStorage
   */
  function clearDraft() {
    localStorage.removeItem(SKLAD_DRAFT_KEY)
  }

  /**
   * Проверяет, есть ли сохраненный черновик
   * @returns {boolean} true если черновик существует
   */
  function hasDraft() {
    return !!localStorage.getItem(SKLAD_DRAFT_KEY)
  }

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft
  }
} 