<template>
  <TheDropdown :title="$t('product.paymentMethods')" outline>
    <template #icon>
      <q-icon name="mdi-format-list-checks" size="sm" class="q-mr-sm" />
    </template>
    <template #body>
      <div class="pay-methods flex column q-gap-md">
        <div class="pay-methods_item" :class="{ 'pay-methods_item--active': selected === PAY_CASH }">
          <label v-ripple class="relative-position flex items-center justify-between">
            <div class="pay-methods_title">{{ $t('bucket.paymentMethod') }}</div>
            <q-radio v-model="selected" :val="PAY_CASH" dense />
          </label>
          <div v-if="selected === PAY_CASH" class="pay-methods_body">
            <p>{{ $t('bucket.cashDescription') }}</p>
          </div>
        </div>
        <div class="pay-methods_item" :class="{ 'pay-methods_item--active': selected === PAY_CARD }">
          <label v-ripple class="relative-position flex items-center justify-between">
            <div class="pay-methods_title">{{ $t('bucket.paymentCard') }}</div>
            <q-radio v-model="selected" :val="PAY_CARD" dense />
          </label>
          <div v-if="selected === PAY_CARD" class="pay-methods_body">
            <p>{{ $t('bucket.cardDescription') }}</p>
          </div>
        </div>
        <div v-if="false" class="pay-methods_item" :class="{ 'pay-methods_item--active': selected === PAY_BOTH }">
          <label v-ripple class="relative-position flex items-center justify-between">
            <div class="pay-methods_title">{{ $t('bucket.mixed') }}</div>
            <q-radio v-model="selected" :val="PAY_BOTH" dense />
          </label>
          <div v-if="selected === PAY_BOTH" class="pay-methods_body flex column q-mt-sm">
            <div class="flex column">
              <p>{{ $t('bucket.paymentMethod') }}</p>
              <InputPrice
                :model-value="formData.cashSum"
                @update:model-value="onChangeCashSum"
                clear
                class="q-mt-xs q-pb-md"
                dense
                tabindex="2"
                :rules="[
                  () => formData.cashSum <= sum || `${$t('validation.valueCannotBeMore')} ${sum - formData.cardSum}`
                ]"
                icon="mdi-cash-multiple"
              />
            </div>
            <div class="flex column">
              <p>{{ $t('bucket.paymentCard') }}</p>
              <InputPrice
                :model-value="cardSumTotal"
                class="q-mt-xs q-pb-none"
                dense
                tabindex="3"
                icon="mdi-card"
                disable
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </TheDropdown>
</template>

<script setup>
import {
  ref,
  reactive,
  watch,
  computed,
} from 'vue'
import { debounce } from 'quasar'
import InputPrice from 'src/components/InputPrice'
import TheDropdown from 'src/components/TheDropdown/TheDropdown.vue'

const PAY_CASH = 'PAY_CASH';
const PAY_CARD = 'PAY_CARD';
const PAY_BOTH = 'PAY_BOTH';

const props = defineProps({
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
  sum: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['on-change'])

const selected = ref(
  props.payCard && props.payCash ?
    PAY_BOTH : props.payCard ? PAY_CARD : PAY_CASH
);

const cardSumTotal = computed(() => props.sum - formData.cashSum)

const formData = reactive({
  cashSum: props.cashSum,
});

// Watch for props changes to update selected value
watch(() => [props.payCard, props.payCash], ([payCard, payCash]) => {
  selected.value = payCard && payCash ? PAY_BOTH : payCard ? PAY_CARD : PAY_CASH;
}, { immediate: true });

// Watch for cashSum prop changes
watch(() => props.cashSum, (newCashSum) => {
  formData.cashSum = newCashSum;
}, { immediate: true });

const debouncedWatch = debounce(() => {
  const result = {
    payCash: selected.value === PAY_BOTH || selected.value === PAY_CASH,
    payCard: selected.value === PAY_BOTH || selected.value === PAY_CARD,
    cashSum: formData.cashSum,
    cardSum: null, // TODO: add card sum
  }
  emit('on-change', result)
}, 300);

watch([selected, formData], debouncedWatch, {
  immediate: true
})

function onChangeCashSum(val) {
  formData.cashSum = val
}
</script>

<style lang="scss" scoped>
.pay-methods {
  border-radius: var(--border-radius-sm);

  &_title {
    opacity: 0.7;
  }
  
  &_body {
    p {
      margin: 0;
      color: var(--text-description);
    }
  }
  
  &_item {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 16px;

    &--active {
      .pay-methods_title {
        opacity: 1;
      }
    }

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  }
}
</style>