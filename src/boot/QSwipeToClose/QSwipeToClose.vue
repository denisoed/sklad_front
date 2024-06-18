<template>
  <div
    ref="QSwipeToCloseRef"
    :class="['q-swipe-to-close', { 'q-swipe-to-close--swiping': swiping }]"
    :style="style"
    v-touch-pan="handlePan"
  >
    <slot />
  </div>
</template>

<script>
import {
  defineComponent,
  computed,
  ref,
  toRefs,
  onUnmounted
} from 'vue';

const DIRECTION_UP = 'up'
const DIRECTION_DOWN = 'down'
const DIRECTION_LEFT = 'left'
const DIRECTION_RIGHT = 'right'

export default defineComponent({
  name: 'QSwipeToClose',
  props: {
    direction: {
      type: String,
      required: true
    }
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const { direction } = toRefs(props)
    const QSwipeToCloseRef = ref(null)
    const swiping = ref(false)
    const translate = ref(0)
    const timer1 = ref(null)
    const timer2 = ref(null)

    function getByDirection(x, y) {
      if ([DIRECTION_LEFT, DIRECTION_RIGHT].includes(direction.value)) {
        return x
      }
      if ([DIRECTION_UP, DIRECTION_DOWN].includes(direction.value)) {
        return y
      }
    }

    function handlePan(details) {
      if (details.direction !== direction.value) return
      if (details.isFirst) swiping.value = true
      translate.value = details.offset[getByDirection('x', 'y')]
      if (details.isFinal) {
        swiping.value = false
        const relativeSwipeDistance = translate.value / QSwipeToCloseRef.value[getByDirection('clientWidth', 'clientHeight')]
        if (relativeSwipeDistance < 0.25) {
          translate.value = 0
          return
        }
        translate.value = window.screen[getByDirection('width', 'height')]
        timer1.value = setTimeout(_ => emit('update:model-value', false), 100)
        timer2.value = setTimeout(_ => translate.value = 0, 300)
      }
    }

    const style = computed(() => ({
      transform: `${getByDirection('translateX', 'translateY')}(${translate.value}px)`
    }))

    onUnmounted(() => {
      clearTimeout(timer1.value)
      clearTimeout(timer2.value)
    })

    return {
      style,
      handlePan,
      swiping,
      QSwipeToCloseRef
    }
  },
});
</script>

<style lang="scss" scoped>
.q-swipe-to-close {
  transition: transform 300ms;
  position: relative;

  &--swiping {
    transition: transform 0ms !important;
  }
}
</style>
