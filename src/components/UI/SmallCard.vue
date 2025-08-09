<template>
  <div
    class="small-card block-bg"
    v-ripple
  >
    <div
      class="small-card_color"
      :style="{
        'background-color': color,
        'color': color?.toLowerCase()?.includes('fff') ? '#000' : '#fff'
      }"
    >
      {{ name?.[0] }}
    </div>
    <div class="small-card_name">
      {{ name }}
    </div>
  </div>
</template>

<script>
import {
  defineComponent
} from 'vue'

export default defineComponent({
  name: 'SmallCard',
  props: {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  }
})
</script>

<style lang="scss" scoped>
.small-card {
  width: 140px;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  cursor: pointer;

  &_name {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 14px;
    padding: 4px 8px;
    box-sizing: border-box;
    text-align: center;
    user-select: none;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0.2;
      width: 100%;
      height: 100%;
      background-color: var(--q-primary);
    }
  }

  &_color {
    width: 60px;
    height: 60px;
    user-select: none;
    background-color: red;
    border-radius: 100%;
    margin: 12px 0;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 24px;
    color: #fff;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 3px 9px 0px;
  }
}
</style>
