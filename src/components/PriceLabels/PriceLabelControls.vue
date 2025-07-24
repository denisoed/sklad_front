<template>
   <div class="flex full-width">
    <q-btn
      v-for="(m, i) of MOVERS"
      :key="i"
      @click="move(m.direction)"
      round
      push
      size="md"
      class="price-label-controls_btn q-mr-md v-click-out-ignore"
      :disable="locked"
    >
      <q-icon :name="m.icon" color="primary" />
    </q-btn>
  </div>
</template>

<script>
import {
  defineComponent,
} from 'vue'

const MOVERS = [
  {
    direction: 'left',
    step: -4,
    icon: 'mdi-arrow-left'
  },
  {
    direction: 'right',
    step: 4,
    icon: 'mdi-arrow-right'
  },
  {
    direction: 'up',
    step: -4,
    icon: 'mdi-arrow-up'
  },
  {
    direction: 'down',
    step: 4,
    icon: 'mdi-arrow-down'
  },
]

export default defineComponent({
  name: 'PriceLabelControls',
  props: {
    locked: {
      type: Boolean,
      default: true
    }
  },
  emits: ['move'],
  setup(props, { emit }) {
    function move(direction) {
      emit('move', direction)
    }

    return {
      move,
      MOVERS
    }
  }
})
</script>

<style lang="scss" scoped>
:deep(.price-label-controls_btn) {
  * {
    pointer-events: none;
  }
}
</style>
