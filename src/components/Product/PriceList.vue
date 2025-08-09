<template>
  <Dropdown :title="$t('product.pricesForProduct')" outline opened>
    <template #icon>
      <q-icon name="mdi-cash" size="sm" class="q-mr-sm" />
    </template>
    <template #body>
      <div class="pay-methods flex column q-gap-md">
        <div class="pay-methods_item" :class="{ 'pay-methods_item--active': selected === DEFAULT_PRICE }">
          <label v-ripple class="relative-position flex items-center justify-between">
            <div class="pay-methods_title q-mr-auto">{{ $t('product.retailPrice') }}</div>
            <div class="flex items-center q-gap-sm">
              <div class="pay-methods_value">
                <PriceFormatter :value="defaultPrice" />
              </div>
              <q-radio v-model="selected" :val="DEFAULT_PRICE" dense />
            </div>
          </label>
          <div v-if="selected === DEFAULT_PRICE" class="pay-methods_body">
          </div>
        </div>
        <div
          v-for="price in prices"
          :key="price.id"
          class="pay-methods_item"
          :class="{ 'pay-methods_item--active': selected === price.id }"
        >
          <label v-ripple class="relative-position flex items-center justify-between">
            <div class="pay-methods_title q-mr-auto">{{ price.name }}</div>
            <div class="flex items-center q-gap-sm">
              <div class="pay-methods_value">
                <PriceFormatter :value="price.price" />
              </div>
              <q-radio v-model="selected" :val="price.id" dense />
            </div>
          </label>
          <div v-if="selected === price.id" class="pay-methods_body">
          </div>
        </div>
        <div class="pay-methods_item" :class="{ 'pay-methods_item--active': selected === OTHER_PRICE }">
          <label v-ripple class="relative-position flex items-center justify-between">
            <div class="pay-methods_title">Другая цена</div>
            <q-radio v-model="selected" :val="OTHER_PRICE" dense />
          </label>
          <div v-if="selected === OTHER_PRICE" class="pay-methods_body flex column q-gap-sm q-pb-none q-mt-md">
            <InputPrice
              v-model="formData.otherPrice"
              clear
              dense
              tabindex="2"
              icon="mdi-cash-multiple"
            />
          </div>
        </div>
      </div>
    </template>
  </Dropdown>
</template>

<script setup>
import {
  ref,
  reactive,
  watch,
} from 'vue'
import { debounce } from 'quasar'
import InputPrice from 'src/components/InputPrice'
import Dropdown from 'src/components/Dropdown'
import PriceFormatter from 'src/components/PriceFormatter.vue'
import { useI18n } from 'vue-i18n'

const DEFAULT_PRICE = 'DEFAULT_PRICE';
const OTHER_PRICE = 'OTHER_PRICE';

const props = defineProps({
  defaultPrice: {
    type: Number,
    default: null
  },
  prices: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['on-change'])
const { t: $t } = useI18n()

// Always default to DEFAULT_PRICE (Розничная цена)
const selected = ref(DEFAULT_PRICE);
const formData = reactive({
  otherPrice: null,
});

const debouncedWatch = debounce((val) => {
  const price = selected.value === DEFAULT_PRICE ?
      props.defaultPrice :
        props.prices.find(price => price.id === selected.value)?.price
  const result = selected.value === OTHER_PRICE ? formData.otherPrice : price
  emit('on-change', result)
}, 300);

// Watch for modelValue changes to update selected
watch(() => props.modelValue, (newValue) => {
  // Only update if modelValue is explicitly set and different from default
  if (newValue !== null && newValue !== undefined && newValue !== props.defaultPrice) {
    const foundPrice = props.prices.find(price => price.price === newValue);
    if (foundPrice) {
      selected.value = foundPrice.id;
      formData.otherPrice = null;
    } else {
      selected.value = OTHER_PRICE;
      formData.otherPrice = newValue;
    }
  }
}, { immediate: true });

watch([selected, formData], debouncedWatch, {
  immediate: true
})
</script>

<style lang="scss" scoped>
.pay-methods {
  border-radius: var(--border-radius);

  &_title {
    opacity: 0.7;
  }

  &_value {
    font-size: 14px;
    font-weight: 500;
    line-height: normal;
    border: 1px solid var(--q-primary);
    padding: 4px;
    border-radius: 4px;
  }
  
  &_body {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 16px;

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

      .pay-methods_value {
        background-color: var(--q-primary);
      }
    }

    &:last-child {
      .pay-methods_body {
        border: none;
        padding-bottom: 0;
      }
    }
  }
}
</style>