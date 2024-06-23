<template>
  <div class="input-plus-minus">
    <p
      class="q-mb-sm"
      v-html="label"
    />
    <div class="flex no-wrap q-gap-sm">
      <q-btn
        color="primary"
        outline
        @click="minus"
        :disable="count < 1"
        style="height:50px;"
        v-vibrate
      >
        <q-icon
          name="mdi-minus"
          size="16px"
        />
      </q-btn>
      <q-input
        outlined
        :model-value="count"
        @update:model-value="onInput"
        placeholder="Кол-во"
        dense
        height="50px"
        :min="0"
        :max="max"
        type="number"
        pattern="[0-9]*"
        inputmode="numeric"
        @keyup="validate"
      />
      <q-btn
        color="primary"
        outline
        @click="plus"
        :disable="count >= max"
        style="height:50px;"
        v-vibrate
      >
        <q-icon
          name="mdi-plus"
          size="16px"
        />
      </q-btn>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  toRefs,
} from 'vue'

export default defineComponent({
  name: 'InputPlusMinus',
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: null
    },
    label: {
      type: String,
      default: null
    }
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)
    const count = ref(modelValue.value)

    function plus() {
      count.value += 1
      emit('update:model-value', count.value)
    }

    function minus() {
      if (count.value >= 1) {
        count.value -= 1
        emit('update:model-value', count.value)
      }
    }

    function onInput(value) {
      count.value = Number(value)
      emit('update:model-value', count.value)
    }

    function checkNumber(e) {
      let evt = e ? e : window.event;
      const charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57))) {
        return false;
      } else {
        return true;
      }
    }

    function validate(e) {
      if (parseInt(e.target.value) < parseInt(e.target.min)) {
        e.target.value = Number(e.target.min)
        count.value = Number(e.target.min)
      }
      if (parseInt(e.target.value) > parseInt(e.target.max)) {
        e.target.value = Number(e.target.max)
        count.value = Number(e.target.max)
      }
      if (!checkNumber(e)) {
        e.preventDefault()
      }
    }

    return {
      count,
      plus,
      minus,
      onInput,
      validate
    }
  }
})
</script>

<style lang="scss">
  .input-plus-minus {
    .q-field {
      width: calc(33.33% - 4px);
    }

    .q-btn {
      width: calc(33.33% - 4px);
    }

    .q-field--dense .q-field__control, .q-field--dense .q-field__marginal {
      height: 50px;
    }
  }
</style>
