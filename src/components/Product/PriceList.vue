<template>
  <Dropdown title="Цены на товар" outline opened>
    <template #icon>
      <q-icon name="mdi-cash" size="sm" class="q-mr-sm" />
    </template>
    <template #body>
      <div class="pay-methods flex column q-gap-md">
        <div class="pay-methods_item" :class="{ 'pay-methods_item--active': selected === DEFAULT_PRICE }">
          <label v-ripple class="relative-position flex items-center justify-between">
            <div class="pay-methods_title">Цена: {{ defaultPrice }}</div>
            <q-radio v-model="selected" :val="DEFAULT_PRICE" dense />
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
            <div class="pay-methods_title">{{ price.name }}: {{ price.price }}</div>
            <q-radio v-model="selected" :val="price.id" dense />
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

<script>
import {
  defineComponent,
  ref,
  reactive,
  watch,
} from 'vue'
import { debounce } from 'quasar'
import InputPrice from 'src/components/InputPrice'
import Dropdown from 'src/components/Dropdown'

const DEFAULT_PRICE = 'DEFAULT_PRICE';
const OTHER_PRICE = 'OTHER_PRICE';

export default defineComponent({
  name: 'PriceList',
  props: {
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
  },
  components: {
    InputPrice,
    Dropdown
  },
  emits: ['on-change'],
  setup(props, { emit }) {
    // Initialize selected based on modelValue
    const getInitialSelected = () => {
      if (props.modelValue === props.defaultPrice) {
        return DEFAULT_PRICE;
      }
      const foundPrice = props.prices.find(price => price.price === props.modelValue);
      if (foundPrice) {
        return foundPrice.id;
      }
      return OTHER_PRICE;
    };

    const selected = ref(getInitialSelected());
    const formData = reactive({
      otherPrice: props.modelValue !== props.defaultPrice && 
                  !props.prices.find(price => price.price === props.modelValue) ? 
                  props.modelValue : null,
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
      if (newValue === props.defaultPrice) {
        selected.value = DEFAULT_PRICE;
        formData.otherPrice = null;
      } else {
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

    return {
      selected,
      formData,
      DEFAULT_PRICE,
      OTHER_PRICE,
    }
  }
})
</script>

<style lang="scss" scoped>
.pay-methods {
  border-radius: var(--border-radius);

  &_title {
    opacity: 0.7;
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