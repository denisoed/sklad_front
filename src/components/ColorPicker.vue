<template>
  <div class="color-picker full-width">
    <div class="color-picker-colors">
      <div class="color-picker-box">
        <div
          v-ripple
          :class="[
            'color-picker-color-it',
            { 'color-picker-color--white': c.color === '#FFFFFF' }
          ]"
          v-for="c in COLORS"
          :key="c"
          :style="{ background: c.color }"
          @click="handlerClick(c)"
          v-vibrate
        >
          <div class="color-picker-pick" v-show="pick.color === c.color">
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
        { 'color-picker--selected-white': pick.color === '#FFFFFF' }
      ]"
      :style="{ background: pick.color }"
    >
      <span class="color-picker--selected-name">{{ pick.name }}</span>
    </div>
  </div>
</template>

<script>
import {
  reactive,
  defineComponent,
  toRefs
} from 'vue'
import useColors, { COLORS } from '../modules/useColors'

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
    const { findColorByHex } = useColors()

    const { selected } = toRefs(props)
    const pick = reactive({
      color: selected.value,
      name: findColorByHex(selected.value)?.name || ''
    })

    function clear() {
      pick.color = null;
      pick.name = ''
      emit('on-change', null)
    }

    function handlerClick(c) {
      pick.color = c.color
      pick.name = c.name
      emit('on-change', c.color)
    }

    return {
      handlerClick,
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
    }

    &-white {
      border: 1px solid #DDD;
      color: #000;
    }

    &-name {
      background-color: black;
      padding: 0 6px;
      border-radius: var(--border-radius-sm);
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
