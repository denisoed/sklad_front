<template>
  <span>{{ formattedPrice }}</span>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { formatPrice } from 'src/modules/usePriceFormatter'

export default defineComponent({
  name: 'PriceFormatter',
  props: {
    value: {
      type: [Number, String],
      default: null
    }
  },
  setup(props) {
    const formattedPrice = computed(() => {
      return formatPrice(props.value)
    })

    return {
      formattedPrice
    }
  }
})
</script> 