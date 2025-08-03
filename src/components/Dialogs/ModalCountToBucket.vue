<template>
  <q-dialog
    :model-value="modelValue"
    position="bottom"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <SwipeToClose
      direction="down"
      @on-close="close"
    >
      <q-card>
        <div class="dialog-close" id="dialog-close">
          <div class="dialog-close-line" />
        </div>
        <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
          <p
            class="full-width text-left text-bold q-mb-none text-subtitle1"
          >
            {{ title || 'Добавить товар в корзину' }}
          </p>

          <q-separator class="full-width q-my-sm" />

          <div class="full-width flex column q-gap-sm q-mb-sm">
            <p class="q-mb-none">Оплата</p>
            <PriceList
              :prices="prices"
              :default-price="newPrice"
              @on-change="onChangePrice"
            />
            <PayMethods
              @on-change="onChangePayMethods"
              :cash-sum="cashSum"
              :card-sum="cardSum"
              :pay-card="payCard"
              :pay-cash="payCash"
              :sum="totalSum"
            />
          </div>

          <div class="full-width flex column q-mt-sm q-gap-sm">
            <AdditionalSettings
              :comment="commentVal"
              :discount-price="localDiscountPrice"
              :percentage-discount="localPercentageDiscount"
              @on-change="onAdditionalSettingsChange"
            />
            <div class="full-width flex justify-between q-gap-sm total-sum bg-deep-orange q-mt-sm q-px-sm">
              <p class="q-mb-none">Итоговая сумма:</p>
              <span class="text-bold">{{ formatPrice(totalSum) }}</span>
            </div>
          </div>
    
          <div class="full-width full-height flex column q-mt-md">
            <InputPlusMinus
              v-model="selectedCount"
              :max="max"
              :min="1"
              label="Кол-во товара для продажи"
              :tooltip-plus-text="`Минимальное количество: ${min}`"
              class="q-my-auto"
            />
            <q-separator class="full-width q-my-md" />
            <div class="flex justify-between full-width no-wrap q-gap-md">
              <q-btn
                class="button-size"
                color="grey"
                icon="mdi-close"
                push
                @click="close"
              />
              <q-btn
                class="button-size"
                color="primary"
                icon="mdi-check"
                push
                @click="submit"
                :disable="!selectedCount || !price || totalSum <= 0"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import InputPlusMinus from 'src/components/InputPlusMinus'
import InputPrice from 'src/components/InputPrice'
import useMoney from 'src/modules/useMoney'
import PayMethods from 'src/components/Product/PayMethods.vue'
import PriceList from 'src/components/Product/PriceList.vue'
import AdditionalSettings from 'src/components/Product/AdditionalSettings.vue'
import SwipeToClose from 'src/components/SwipeToClose.vue'
import {
  ref,
  toRefs,
  watch,
  reactive,
  computed
} from 'vue'

const emit = defineEmits(['submit'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: null
  },
  comment: {
    type: String,
    default: null
  },
  selected: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    default: null
  },
  cashSum: {
    type: Number,
    default: null
  },
  cardSum: {
    type: Number,
    default: null
  },
  payCash: {
    type: Boolean,
    default: false
  },
  payCard: {
    type: Boolean,
    default: false
  },
  percentageDiscount: {
    type: Boolean,
    default: false
  },
  discountPrice: {
    type: Number,
    default: null
  },
  newPrice: {
    type: Number,
    default: null
  },
  prices: {
    type: Array,
    default: () => []
  }
})

const {
  selected,
  comment
} = toRefs(props)

const {
  formatPrice
} = useMoney()

const commentVal = ref(comment.value)
const selectedCount = ref(selected.value)
const localPercentageDiscount = ref(props.percentageDiscount)
const localDiscountPrice = ref(props.discountPrice)
const payMethods = reactive({})
const price = ref(props.newPrice)

const totalSum = computed(() => {
  let sum = 0
  if (localPercentageDiscount.value) {
    sum = (price.value - ((price.value / 100) * localDiscountPrice.value)) * selectedCount.value
  } else {
    sum = (price.value * selectedCount.value) - localDiscountPrice.value
  }
  return Math.max(sum, 0)
})

function close() {
  emit('update:modelValue', false)
}

function submit() {
  emit('submit', {
    countSizes: selectedCount.value,
    percentageDiscount: localPercentageDiscount.value,
    discount: localDiscountPrice.value,
    comment: commentVal.value,
    ...payMethods,
    cashSum: price.value,
  })
  close()
}

function onChangePrice(p) {
  price.value = p
}

function onChangePayMethods(obj) {
  Object.assign(payMethods, obj);
}

function onAdditionalSettingsChange(settings) {
  commentVal.value = settings.comment
  localDiscountPrice.value = settings.discount
  localPercentageDiscount.value = settings.percentageDiscount
}

watch(() => props.modelValue, (val) => {
  if (val) {
    localPercentageDiscount.value = props.percentageDiscount
    localDiscountPrice.value = props.discountPrice
    selectedCount.value = selected.value
    price.value = props.newPrice
  }
})
</script>

<style lang="scss" scoped>
.total-sum {
  border-radius: var(--border-radius-xs);
}
</style>