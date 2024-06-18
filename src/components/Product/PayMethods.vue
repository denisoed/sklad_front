<template>
  <div class="pay-methods q-py-sm q-pl-md q-pr-sm">
    <div class="pay-methods_item" :class="{ 'pay-methods_item--active': selected === PAY_CASH }">
      <label v-ripple class="relative-position flex items-center justify-between">
        <div class="pay-methods_title">Наличными</div>
        <q-radio v-model="selected" :val="PAY_CASH" />
      </label>
      <div v-if="selected === PAY_CASH" class="pay-methods_body">
        <p>Этот товар будет оплачен наличными</p>
      </div>
    </div>
    <div class="pay-methods_item" :class="{ 'pay-methods_item--active': selected === PAY_CARD }">
      <label v-ripple class="relative-position flex items-center justify-between">
        <div class="pay-methods_title">Картой</div>
        <q-radio v-model="selected" :val="PAY_CARD" />
      </label>
      <div v-if="selected === PAY_CARD" class="pay-methods_body">
        <p>Этот товар будет оплачен картой</p>
      </div>
    </div>
    <div class="pay-methods_item" :class="{ 'pay-methods_item--active': selected === PAY_BOTH }">
      <label v-ripple class="relative-position flex items-center justify-between">
        <div class="pay-methods_title">Смешанная оплата</div>
        <q-radio v-model="selected" :val="PAY_BOTH" />
      </label>
      <div v-if="selected === PAY_BOTH" class="pay-methods_body flex column q-gap-sm">
        <div class="flex column">
          <p>Наличными</p>
          <InputPrice
            v-model="formData.cashSum"
            clearable
            autofocus
            class="q-mt-xs"
            dense
            tabindex="2"
            icon="mdi-cash-multiple"
            />
          </div>
          <div class="flex column">
            <p>Картой</p>
            <InputPrice
              v-model="formData.cardSum"
              clearable
              class="q-mt-xs"
              dense
              tabindex="3"
              icon="mdi-card"
            />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  reactive,
  watch,
} from 'vue'
import InputPrice from 'src/components/InputPrice'
import debounce from 'lodash.debounce'

const PAY_CASH = 'PAY_CASH';
const PAY_CARD = 'PAY_CARD';
const PAY_BOTH = 'PAY_BOTH';

export default defineComponent({
  name: 'PayMethods',
  props: {
    cashSum: {
      type: Number,
      default: null,
    },
    cardSum: {
      type: Number,
      default: null,
    },
    payCash: {
      type: Boolean,
      default: false
    },
    payCard: {
      type: Boolean,
      default: false
    },
  },
  components: {
    InputPrice
  },
  emits: ['on-change'],
  setup(props, { emit }) {
    const selected = ref(
      props.payCard && props.payCash ?
        PAY_BOTH : props.payCard ? PAY_CARD : PAY_CASH
    );
    const formData = reactive({
      cashSum: props.cashSum,
      cardSum: props.cardSum,
    });
    
    const debouncedWatch = debounce((val) => {
      const result = {
        payCash: selected.value === PAY_BOTH || selected.value === PAY_CASH,
        payCard: selected.value === PAY_BOTH || selected.value === PAY_CARD,
        cashSum: formData.cashSum,
        cardSum: formData.cardSum,
      }
      emit('on-change', result)
    }, 800);

    watch([selected, formData], debouncedWatch, {
      immediate: true
    })

    return {
      selected,
      formData,
      PAY_CASH,
      PAY_CARD,
      PAY_BOTH,
    }
  }
})
</script>

<style lang="scss" scoped>
.pay-methods {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);

  &_title {
    opacity: 0.7;
  }
  
  &_body {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 10px;
    margin-bottom: 10px;
    padding-right: 10px;

    p {
      margin: 0;
      color: var(--text-description);
    }
  }

  &_item {
    &--active {
      .pay-methods_title {
        opacity: 1;
      }
    }

    &:last-child {
      .pay-methods_body {
        border: none;
        margin: 0;
      }
    }
  }
}
</style>