<template>
  <span>
    {{ value }}
  </span>
</template>

<script>
import {
  defineComponent,
} from 'vue'

export default defineComponent({
  name: 'PriceLabelText',
  props: {
    value: {
      type: String,
      default: 'Text'
    }
  },
  setup() {}
})
</script>
