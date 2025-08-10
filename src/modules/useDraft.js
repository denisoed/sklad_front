import { SKLAD_DRAFT_KEY } from 'src/config'

export default function useDraft() {
  /**
   * Save draft of product to localStorage
   * @param {Object} product - product object to save
   */
  function saveDraft(product) {
    localStorage.setItem(SKLAD_DRAFT_KEY, JSON.stringify(product))
  }

  /**
   * Load draft of product from localStorage
   * @returns {Object|null} draft of product or null
   */
  function loadDraft() {
    const draft = localStorage.getItem(SKLAD_DRAFT_KEY)
    return draft ? JSON.parse(draft) : null
  }

  /**
   * Clear draft of product from localStorage
   */
  function clearDraft() {
    localStorage.removeItem(SKLAD_DRAFT_KEY)
  }

  /**
   * Check if draft of product exists in localStorage
   * @returns {boolean} true if draft exists
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