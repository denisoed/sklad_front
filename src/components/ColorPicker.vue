<template>
  <div class="color-picker full-width">
    <div class="color-picker-colors">
      <div class="color-picker-box">
        <div
          v-ripple
          :class="[
            'color-picker-color-it',
            { 'color-picker-color--white': c.color === '#FFFFFF' },
            { 'color-picker-color--selected': isColorSelected(c) }
          ]"
          v-for="c in COLORS"
          :key="c"
          :style="{ background: c.color }"
          @click="handlerClick(c)"
        >
          <div class="color-picker-pick" v-show="isColorSelected(c)">
            <svg style="width:auto;height:40px;" viewBox="0 0 24 24">
              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    <div v-if="multiselect && selectedColors.length > 0" class="color-picker--selected-colors">
      <div
        v-for="color in selectedColors"
        :key="color.color"
        :class="[
          'color-picker--selected',
          {
            'color-picker--selected-white': color.color === '#FFFFFF',
            'full-width': selectedColors.length === 1
          }
        ]"
        :style="{ background: color.color }"
      >
        <span class="color-picker--selected-name">{{ $t(color.nameKey) }}</span>
        <q-btn
          flat
          round
          dense
          size="xs"
          icon="close"
          class="color-picker--remove-btn"
          @click="removeColor(color)"
        />
      </div>
    </div>
    <div
      v-else-if="!multiselect && pick.color"
      :class="[
        'color-picker--selected',
        { 'color-picker--selected-white': pick.color === '#FFFFFF' }
      ]"
      :style="{ background: pick.color }"
    >
      <span class="color-picker--selected-name">{{ $t(pick.nameKey) }}</span>
    </div>
  </div>
</template>

<script setup>
import {
  reactive,
  toRefs
} from 'vue'
import useColors, { COLORS } from '../modules/useColors'

const props = defineProps({
  selected: {
    type: String,
    default: '#FFFFFF'
  },
  selectedColors: {
    type: Array,
    default: () => []
  },
  multiselect: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['on-change'])

const { findColorByHex } = useColors()

const { selected, selectedColors, multiselect } = toRefs(props)

const pick = reactive({
  color: selected.value,
  nameKey: findColorByHex(selected.value)?.nameKey || ''
})

const selectedColorsArray = reactive([...selectedColors.value])

const isColorSelected = (color) => {
  if (multiselect.value) {
    return selectedColorsArray.some(selectedColor => selectedColor.color === color.color)
  }
  return pick.color === color.color
}

function removeColor(colorToRemove) {
  const index = selectedColorsArray.findIndex(color => color.color === colorToRemove.color)
  if (index !== -1) {
    selectedColorsArray.splice(index, 1)
    emit('on-change', [...selectedColorsArray])
  }
}

function handlerClick(c) {
  if (multiselect.value) {
    const existingIndex = selectedColorsArray.findIndex(color => color.color === c.color)
    if (existingIndex !== -1) {
      selectedColorsArray.splice(existingIndex, 1)
    } else {
      selectedColorsArray.push(c)
    }
    emit('on-change', [...selectedColorsArray])
  } else {
    pick.color = c.color
    pick.nameKey = c.nameKey
    emit('on-change', pick)
  }
}
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

  &--selected-colors {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }

  &--selected {
    min-width: calc(50% - 2px);
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
    color: #fff;
    border-radius: var(--border-radius-sm);
    position: relative;
    
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
      margin-right: 4px;
    }
  }

  &--remove-btn {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    width: 16px;
    height: 16px;
    min-width: 16px;
    min-height: 16px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.5);
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
    transition: all 0.2s ease;

    &--selected {
      transform: scale(0.95);
      box-shadow: 0 0 0 2px var(--q-primary);
    }
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
