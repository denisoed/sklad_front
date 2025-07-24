<template>
  <div
    ref="dragElement"
    v-drag="{
      snap: 4,
      position: { y, x },
      canDrag: selected,
    }"
    @v-drag-end="onDrag"
    @click="onClick"
    v-click-out="onClickOutside"
    class="drag-element"
    :class="{ 'drag-element--selected': selected }"
  >
    <slot />
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  toRefs
} from 'vue'

export default defineComponent({
  name: 'DragElement',
  props: {
    positionX: {
      type: Number,
      default: 0
    },
    positionY: {
      type: Number,
      default: 0
    },
  },
  emits: ['on-select'],
  setup(props, { emit }) {
    const { positionX, positionY } = toRefs(props)
    const dragElement = ref(null)
    const selected = ref(false)
    const x = ref(positionX.value)
    const y = ref(positionY.value)

    function onClick() {
      if (!selected.value) {
        selected.value = true
        emit('on-select', dragElement.value)
      }
    }
    
    function onClickOutside(event) {
      if (selected.value) {
        selected.value = false
        if (!event.target.classList.contains('v-click-out')) {
          emit('on-select', null)
        }
      }
    }

    function onDrag(position) {
      x.value = position.detail.left
      y.value = position.detail.top
    }

    return {
      onDrag,
      onClick,
      onClickOutside,
      selected,
      dragElement,
      x,
      y,
    }
  }
})
</script>

<style lang="scss">
.drag-element {
  position: absolute;
  display: inline-block;

  &--selected {
    outline: 1px solid var(--q-primary);
  }

  .q-icon {
    right: -15px;
    bottom: -15px;
  }

  * {
    user-select: none;
    pointer-events: none;
  }
}
</style>