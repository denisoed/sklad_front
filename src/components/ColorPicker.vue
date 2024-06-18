<template>
  <div class="color-picker full-width">
    <div class="color-picker-colors">
      <div class="color-picker-box">
        <div
          class="color-picker-color-group"
          v-for="(group, $idx) in COLORS"
          :key="$idx"
        >
          <div
            v-ripple
            :class="[
              'color-picker-color-it',
              { 'color-picker-color--white': c === '#FFFFFF' }
            ]"
            v-for="c in group"
            :key="c"
            :style="{ background: c }"
            @click="handlerClick(c)"
          >
            <div class="color-picker-pick" v-show="pick === c">
              <svg style="width:auto;height:40px;" viewBox="0 0 24 24">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
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
import material from 'material-colors'
import tinycolor from 'tinycolor2'

const COLOR_MAP = [
  'pink', 'purple', 'deepPurple',
  'indigo', 'blue', 'lightBlue', 'cyan',
  'teal', 'green', 'lightGreen', 'lime',
  'yellow', 'amber', 'orange', 'red', 'brown', 'blueGrey',
  'black'
]
const COLOR_LEVEL = ['900', '700', '500', '300', '100']
const COLORS = (() => {
  const colors = []
  COLOR_MAP.forEach((type) => {
    let typeColor = []
    if (type.toLowerCase() === 'black' || type.toLowerCase() === 'white') {
      typeColor = typeColor.concat(['#000000', '#FFFFFF'])
    } else {
      COLOR_LEVEL.forEach((level) => {
        const color = material[type][level]
        typeColor.push(color.toUpperCase())
      })
    }
    colors.push(typeColor)
  })
  return colors
})()

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
  
  &-colors {
    height: 140px;
    overflow-y: scroll;

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
    flex-direction: column-reverse;
    overflow: hidden;
    gap: 4px;
  }
  
  &-color-group {
    display: flex;
    gap: 4px;
  }
  
  &-color-it {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 40px;
    cursor: pointer;
    background: #880e4f;
    overflow: hidden;
    -ms-border-radius: 2px 2px 0 0;
    -moz-border-radius: 2px 2px 0 0;
    -o-border-radius: 2px 2px 0 0;
    -webkit-border-radius: 2px 2px 0 0;
    border-radius: 2px 2px 0 0;
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
