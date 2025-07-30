<template>
  <q-input
    ref="inputRef"
    :model-value="formattedValue"
    outlined
    :class="{ 'is-clearable': clear && formattedValue }"
    :max="max"
    enterkeyhint="done"
    v-bind="$attrs"
  >
    <template v-if="icon" #prepend>
      <q-icon :name="icon" />
    </template>
    <template v-if="clear && formattedValue" #append>
      <q-btn
        icon="mdi-close-circle"
        class="q-p-none"
        flat
        round
        @click="onClear"
      />
    </template>
  </q-input>
</template>

<script>
import {
  defineComponent,
  toRefs,
  watch
} from 'vue'
import { useCurrencyInput } from 'vue-currency-input'

export default defineComponent({
  name: 'InputPrice',
  props: {
    icon: {
      type: String,
      default: 'mdi-cash-multiple'
    },
    clear: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Number,
      default: null
    },
  },
  emits: ['update:model-value'],
  setup(props) {
    const { modelValue } = toRefs(props)

    const { inputRef, formattedValue, setValue } = useCurrencyInput({
      currency: 'USD',
      currencyDisplay: 'hidden',
      locale: 'en',
      hideCurrencySymbolOnFocus: false,
      hideGroupingSeparatorOnFocus: false,
      hideNegligibleDecimalDigitsOnFocus: false,
    })

    function onClear() {
      setValue(null)
    }

    watch(modelValue, (value) => {
      setValue(value)
    })

    return {
      inputRef,
      formattedValue,
      onClear
    }
  }
})
</script>

<style lang="scss">
  .is-clearable {
    .q-field__inner .q-field__control {
      padding-right: 0 !important;
    }
  }
</style>