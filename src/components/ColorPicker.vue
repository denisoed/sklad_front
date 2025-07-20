<template>
  <div class="color-picker full-width">
    <div class="color-picker-colors">
      <div class="color-picker-box">
        <div
          v-ripple
          :class="[
            'color-picker-color-it',
            { 'color-picker-color--white': c === '#FFFFFF' }
          ]"
          v-for="c in COLORS"
          :key="c"
          :style="{ background: c }"
          @click="handlerClick(c)"
          v-vibrate
        >
          <div class="color-picker-pick" v-show="pick === c">
            <svg style="width:auto;height:40px;" viewBox="0 0 24 24">
              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="pick"
      :class="[
        'color-picker--selected',
        { 'color-picker--selected-white': pick === '#FFFFFF' }
      ]"
      :style="{ background: pick }"
    />
  </div>
</template>

<script>
import {
  ref,
  defineComponent,
  toRefs
} from 'vue'
import tinycolor from 'tinycolor2'

// Simple color palette without gradients
const COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#808080', '#008000', '#0000FF',
  '#800000', '#008080', '#C0C0C0', '#FF6347',
  '#FF1493', '#FFD700', '#DC143C', '#4B0082'
]

export default defineComponent({
  name: 'ColorPicker',
  props: {
    selected: {
      type: String,
      default: '#FFFFFF'
    }
  },
  emits: ['on-change'],
  setup(props, { emit }) {
    const { selected } = toRefs(props)
    const pick = ref(selected.value)

    function equal(color) {
      return color?.toLowerCase() === pick.value?.toLowerCase()
    }

    function clear() {
      pick.value = null;
      emit('on-change', pick.value)
    }

    function handlerClick(c) {
      const hex = tinycolor(c)
      pick.value = hex.getOriginalInput()
      emit('on-change', pick.value)
    }

    return {
      handlerClick,
      equal,
      pick,
      COLORS,
      clear
    }
  }
})
</script>

<style lang="scss" scoped>
.color-picker {
  width: 100%;
  background-color: var(--block-bg);
  box-shadow: var(--box-shadow);
  padding: 4px;
  border-radius: var(--border-radius-sm);
  
  &-colors {
    &::-webkit-scrollbar {
      display: none;
    }
  }

  &--selected {
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
    color: #fff;
    border-radius: var(--border-radius-sm);
    
    span {
      color: white;
      mix-blend-mode: difference;
    }

    &-white {
      border: 1px solid #DDD;
      color: #000;
    }
  }

  &-box {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  &-color-it {
    position: relative;
    box-sizing: border-box;
    width: calc(20% - 3.2px);
    height: 40px;
    cursor: pointer;
    background: #880e4f;
    overflow: hidden;
    border-radius: var(--border-radius-sm);
  }

  &-color--white {
    border: 1px solid #DDD;
  }
  
  &-pick {
    fill: rgb(255, 255, 255);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &-color--white &-pick {
    fill: rgb(51, 51, 51);
  }
}
</style>
