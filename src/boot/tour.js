import { boot } from 'quasar/wrappers'
import { getHintConfig, isHintShown, markHintAsShown, createIntersectionObserver, getElementRect } from 'src/modules/tour'
import { createApp, h, reactive } from 'vue'
import Overlay from 'src/components/Tour/OverlayComp.vue'

export default boot(async ({ app }) => {
  let state = reactive({
    visible: false,
    rect: { x: 0, y: 0, width: 0, height: 0 },
    text: '',
    position: 'auto',
    key: null,
  })
  let currentCleanup = null

  let container = document.createElement('div')
  document.body.appendChild(container)

  function closeAndPersist() {
    if (state.key) {
      markHintAsShown(state.key)
    }
    if (currentCleanup) {
      currentCleanup()
      currentCleanup = null
    }
    state.visible = false
    state.key = null
  }

  function openFor(el, cfg) {
    state.rect = getElementRect(el, cfg.padding)
    state.text = cfg.text
    state.position = cfg.position
    state.key = cfg.key
    state.visible = true
    // Keep hole aligned on scroll/resize
    const update = () => { state.rect = getElementRect(el, cfg.padding) }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    // Close and persist when user clicks the highlighted element
    const onTargetClick = () => {
      closeAndPersist()
    }
    el.addEventListener('click', onTargetClick, { once: true })
    const stop = () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
    const unwatch = () => {
      stop()
      el.removeEventListener('click', onTargetClick)
    }
    currentCleanup = unwatch
    return unwatch
  }

  // Mount reactive overlay app once; it will update with state changes
  const overlayApp = createApp({
    setup() {
      return () => h(Overlay, {
        visible: state.visible,
        targetRect: state.rect,
        text: state.text,
        position: state.position,
        onAck: closeAndPersist,
      })
    }
  })
  overlayApp.mount(container)

  app.directive('tour', {
    mounted(el, binding) {
      const cfg = getHintConfig(binding.value)
      if (!cfg || !cfg.key || !cfg.text) return
      if (isHintShown(cfg.key)) return

      let cleanup = null
      const observer = createIntersectionObserver(el, () => {
        if (!isHintShown(cfg.key)) {
          cleanup = openFor(el, cfg)
        }
      })

      el.__tourCleanup__ = () => {
        observer.disconnect()
        if (cleanup) cleanup()
      }
    },
    unmounted(el) {
      if (el.__tourCleanup__) {
        el.__tourCleanup__()
        delete el.__tourCleanup__
      }
    }
  })
})


