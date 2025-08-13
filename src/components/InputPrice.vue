<template>
  <q-input
    ref="inputRef"
    :model-value="displayValue"
    outlined
    :class="{ 'is-clearable': clear && displayValue }"
    enterkeyhint="done"
    v-bind="$attrs"
    inputmode="decimal"
    @update:model-value="onInput"
    @blur="onBlur"
    @focus="onFocus"
  >
    <template v-if="icon" #prepend>
      <q-icon :name="icon" />
    </template>
    <template v-if="clear && displayValue" #append>
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
  watch,
  ref
} from 'vue'

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
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)

    const inputRef = ref(null)
    const displayValue = ref('')
    const isFocused = ref(false)

    function formatWithGrouping(value) {
      if (value === null || value === undefined || value === '') return ''
      const [intPartRaw, fracPartRaw] = String(value).split('.')
      const intPart = intPartRaw.replace(/\D/g, '')
      const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      return fracPartRaw !== undefined && fracPartRaw !== ''
        ? `${grouped}.${fracPartRaw}`
        : grouped
    }

    function parseNumber(val) {
      if (val === null || val === undefined || val === '') return null
      const normalized = String(val)
        .replace(/\s+/g, '')
        .replace(',', '.')
        .replace(/[^\d.]/g, '')
      if (normalized === '' || normalized === '.') return null
      const parts = normalized.split('.')
      const sanitized = parts.length > 2
        ? `${parts[0]}.${parts.slice(1).join('')}`
        : normalized
      const num = parseFloat(sanitized)
      return Number.isNaN(num) ? null : num
    }

    function onInput(val) {
      // sanitize typing (allow digits and one decimal separator)
      const text = String(val || '')
        .replace(/,/g, '.')
        .replace(/[^\d.]/g, '')
        .replace(/(\..*)\./g, '$1')
      displayValue.value = text
      emit('update:modelValue', parseNumber(text))
    }

    function onBlur() {
      isFocused.value = false
      displayValue.value = formatWithGrouping(displayValue.value)
    }

    function onFocus() {
      isFocused.value = true
      // remove grouping for easier editing
      displayValue.value = String(displayValue.value || '').replace(/\s+/g, '')
    }

    function onClear() {
      displayValue.value = ''
      emit('update:modelValue', null)
    }

    watch(modelValue, (value) => {
      // keep display in sync when external model changes
      if (isFocused.value) {
        displayValue.value = value === null ? '' : String(value)
      } else {
        displayValue.value = value === null ? '' : formatWithGrouping(value)
      }
    }, { immediate: true })

    return {
      inputRef,
      displayValue,
      onInput,
      onBlur,
      onFocus,
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