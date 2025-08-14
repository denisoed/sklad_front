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
          <div class="tour-text">{{ text }}</div>
          <button class="tour-btn" @click="onAcknowledge">Понял</button>
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

  let top = 0
  let left = Math.min(Math.max(12, midX - 160), vw - 12 - 320)

  if (preferred === 'top' || (preferred === 'auto' && above && !below)) {
    top = Math.max(12, props.targetRect.y - margin)
  } else {
    top = Math.min(vh - 12, props.targetRect.y + props.targetRect.height + margin)
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
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
  backdrop-filter: blur(4px);
  background: rgba(0,0,0,0.35);
}

.tour-hole {
  position: absolute;
  border-radius: 8px;
  outline: 2px solid rgba(255,255,255,0.8);
  pointer-events: none;
}

.tour-popover {
  position: absolute;
  width: 320px;
  max-width: calc(100vw - 24px);
  transform: translateY(0);
  color: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.tour-text {
  font-size: 16px;
  line-height: 1.4;
}

.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.tour-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: var(--q-primary, #027be3);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.tour-btn:active { transform: translateY(1px); }
</style>


