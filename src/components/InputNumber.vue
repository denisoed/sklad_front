<template>
  <div>
    <q-input
      readonly
      outlined
      :model-value="number"
      @update:model-value="setNumber"
      type="number"
      :label="label"
      :hint="hint"
      lazy-rules
      enterkeyhint="done"
      :class="{ 'focused': showing }"
    >
      <q-menu
        v-model="showing"
        max-width="300px"
        anchor="bottom middle"
        self="top middle"
      >
        <div class="flex flex-wrap q-gap-sm q-pa-sm">
          <q-btn
            v-for="(n, i) of NUMBERS"
            :key="i"
            style="width: 30%;height: 50px;"
            color="primary"
            :label="n"
            push
            @click="setNumber(n)"
            class="input-number_num"
          />
          <q-btn
            style="width: 30%;height: 50px;"
            color="primary"
            icon="mdi-check"
            push
            @click="showing = false"
            class="input-number_save"
          />
          <q-btn
            style="width: 30%;height: 50px;"
            color="deep-orange"
            icon="mdi-chevron-left"
            push
            @click="removeNumber"
            class="input-number_clear"
          />
        </div>
      </q-menu>
    </q-input>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  toRefs,
  watch
} from 'vue'

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

export default defineComponent({
  name: 'InputNumber',
  props: {
    label: {
      type: String,
      default: 'Поля для ввода чисел'
    },
    hint: {
      type: String,
      default: null
    },
    modelValue: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)
    const number = ref(modelValue.value)
    const showing = ref(false)

    function setNumber(num) {
      number.value = String(number.value || '').concat(num)
      emit('update:model-value', number.value)
    }

    function removeNumber() {
      number.value = String(number.value || '').slice(0, -1)
      emit('update:model-value', number.value)
    }

    watch(modelValue, (newValue) => {
      number.value = newValue
    })

    return {
      setNumber,
      removeNumber,
      number,
      showing,
      NUMBERS,
    }
  }
})
</script>

<style lang="scss">
  .q-field.q-field--readonly .q-field__control:before {
    border-style: solid !important;
  }

  .focused {
    &.q-field .q-field__control:before {
      border-color: var(--q-primary-text) !important;
      border-width: 2px;
    }

    &.q-field .q-field__label {
      color: var(--q-primary-text) !important;
    }
  }

  .input-number {
    &_num {
      order: 1;

      &:nth-last-child(-n+3) {
        order: 3;
      }
    }

    &_save {
      order: 2;
    }

    &_clear {
      order: 4;
    }
  }
</style>
