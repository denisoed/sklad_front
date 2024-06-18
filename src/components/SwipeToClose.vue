<template>
  <div
    :class="['ext-swipe-to-close', { '--swiping': swiping }]"
    :style="style"
    v-touch-pan.prevent.mouse="handlePan"
  >
    <slot />
  </div>
</template>

<script>
import {
  defineComponent,
  computed,
  ref,
  toRefs
} from 'vue';

export default defineComponent({
  name: 'SwipeToClose',
  props: {
    direction: {
      type: String,
      required: true
    }
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const { direction } = toRefs(props)
    const swiping = ref(false)
    const translateX = ref(0)

    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect()
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      )
    }

    function handlePan(details) {
      if (details.direction !== direction.value) return
      details.evt.preventDefault()
      details.evt.stopPropagation()
      if (details.isFirst) swiping.value = true
      translateX.value = details.offset.x
      if (details.isFinal) {
        swiping.value = false
        const relativeSwipeDistance = translateX.value / details.evt.target.clientWidth
        if (relativeSwipeDistance < 0.25) {
          translateX.value = 0
          return
        }
        translateX.value = window.screen.width
        setTimeout(_ => emit('update:model-value', false), 100)
        setTimeout(_ => translateX.value = 0, 300)
      }
    }

    const style = computed(() => ({ transform: `translateX(${translateX.value}px)` }))

    return {
      style,
      handlePan
    }
  },
});
</script>

<style lang="scss" scoped>
.ext-swipe-to-close {
  transition: all 300ms;
  position: relative;
  > div:not(.ext-swipe-to-close__swipe-disable-line) {
    height: inherit;
    min-height: fit-content;
  }
  &.--swiping {
    transition: all 0ms;
  }
  &__swipe-disable-line {
    width: 100%;
    position: absolute;
    height: 1px;
    background: transparent;
    top: -15px;
  }
}
.q-dialog__inner--maximized {
  .ext-swipe-to-close {
    &__swipe-disable-line {
      top: 1px !important;
    }
  }
}
</style>
