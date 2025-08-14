<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="tour-overlay" @click.stop>
        <!-- 4 panels to blur everything around the hole -->
        <div class="tour-panel" :style="topPanel"></div>
        <div class="tour-panel" :style="leftPanel"></div>
        <div class="tour-panel" :style="rightPanel"></div>
        <div class="tour-panel" :style="bottomPanel"></div>
        <div class="tour-hole" :style="holeStyle"></div>
        <div class="tour-popover block-bg flex column q-gap-md" :style="popoverStyle">
          <button class="tour-close" @click="onAcknowledge" aria-label="Close" title="Закрыть">×</button>
          <div class="tour-text">{{ text }}</div>
        </div>
      </div>
    </transition>
  </teleport>
  </template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  targetRect: { type: Object, default: () => ({ x: 0, y: 0, width: 0, height: 0 }) },
  text: { type: String, default: '' },
  position: { type: String, default: 'auto' },
})

const emit = defineEmits(['ack'])

const holeStyle = computed(() => ({
  left: `${props.targetRect.x}px`,
  top: `${props.targetRect.y}px`,
  width: `${props.targetRect.width}px`,
  height: `${props.targetRect.height}px`,
}))

// Panels around the hole to apply blur and dim
const topPanel = computed(() => ({
  left: '0px',
  top: '0px',
  width: '100vw',
  height: `${props.targetRect.y}px`,
}))
const leftPanel = computed(() => ({
  left: '0px',
  top: `${props.targetRect.y}px`,
  width: `${props.targetRect.x}px`,
  height: `${props.targetRect.height}px`,
}))
const rightPanel = computed(() => ({
  left: `${props.targetRect.x + props.targetRect.width}px`,
  top: `${props.targetRect.y}px`,
  width: `calc(100vw - ${props.targetRect.x + props.targetRect.width}px)`,
  height: `${props.targetRect.height}px`,
}))
const bottomPanel = computed(() => ({
  left: '0px',
  top: `${props.targetRect.y + props.targetRect.height}px`,
  width: '100vw',
  height: `calc(100vh - ${props.targetRect.y + props.targetRect.height}px)`,
}))

const popoverStyle = computed(() => {
  const margin = 12
  const preferred = props.position
  const vw = window.innerWidth
  const vh = window.innerHeight
  const midX = props.targetRect.x + props.targetRect.width / 2
  const above = props.targetRect.y >= 120
  const belowSpace = vh - (props.targetRect.y + props.targetRect.height)
  const below = belowSpace >= 120

  const placeAbove = preferred === 'top' || (preferred === 'auto' && above && !below)

  let top = 0
  let left = Math.min(Math.max(12, midX - 160), vw - 12 - 320)

  if (placeAbove) {
    // Place popover above the target; account for its own height via translateY(-100%)
    top = Math.max(12, props.targetRect.y - margin)
  } else {
    // Place popover below the target
    top = Math.min(vh - 12, props.targetRect.y + props.targetRect.height + margin)
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    transform: placeAbove ? 'translateY(-100%)' : 'translateY(0)'
  }
})

function onAcknowledge() {
  emit('ack')
}
</script>

<style lang="scss" scoped>
.tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: auto;
}

.tour-panel {
  position: absolute;
  backdrop-filter: blur(5px);
  background: transparent !important;
}

.tour-hole {
  position: absolute;
  border-radius: 8px;
  pointer-events: none;
}

.tour-popover {
  position: absolute;
  width: 320px;
  max-width: calc(100vw - 24px);
  color: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.tour-text {
  font-size: 14px;
  line-height: 1.4;
}

.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.tour-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 25px;
  height: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: inherit;
  border: none;
  border-radius: 100%;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  background: red;
}
.tour-close:hover { background: rgba(255, 255, 255, 0.08); }
.tour-close:active { transform: translateY(1px); }
</style>


