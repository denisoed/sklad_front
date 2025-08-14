import { LocalStorage } from 'quasar'
import { TOUR_STORAGE_PREFIX, TOUR_HINTS } from 'src/config/tour'

function storageKey(key) {
  return `${TOUR_STORAGE_PREFIX}${key}`
}

export function isHintShown(key) {
  return !!LocalStorage.getItem(storageKey(key))
}

export function markHintAsShown(key) {
  LocalStorage.set(storageKey(key), true)
}

export function getHintConfig(value) {
  if (!value) return null
  const key = typeof value === 'string' ? value : value.key
  const defaults = TOUR_HINTS[key] || {}
  const overrides = typeof value === 'object' ? value : {}
  return {
    key,
    text: overrides.text || defaults.text || '',
    position: overrides.position || defaults.position || 'auto',
    // Optional spacing around target
    padding: overrides.padding || defaults.padding || 8,
  }
}

export function createIntersectionObserver(targetEl, onEnter) {
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry && entry.isIntersecting) {
      onEnter()
    }
  }, { threshold: 0.5 })
  observer.observe(targetEl)
  return observer
}

export function getElementRect(el, padding = 8) {
  const rect = el.getBoundingClientRect()
  return {
    x: Math.max(0, rect.left - padding),
    y: Math.max(0, rect.top - padding),
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  }
}


