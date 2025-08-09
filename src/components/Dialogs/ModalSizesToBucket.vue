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

        <transition name="slide-fade" mode="out-in">
          <!-- Step 1 -->
          <div
            v-if="!isStepTwo"
            class="full-width"
          >
            <div class="full-width flex column q-gap-sm q-mb-sm">
              <p class="q-mb-none">Оплата</p>
              <PriceList
                :prices="prices"
                :default-price="newPrice"
                :model-value="price"
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

            <div class="full-width flex column q-mb-md q-gap-sm">
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

            <p class="q-mb-sm">Размеры</p>
            <div
              class="btn-sizes_list"
            >
              <q-btn
                v-for="(s, i) of listSizes"
                :key="i"
                :color="!selectedSizes.some(sz => sz.size === s.size) ? 'white' : 'primary'"
                text-color="white"
                :outline="!selectedSizes.some(sz => sz.size === s.size)"
                push
                class="btn-sizes-btn border-radius-sm"
                :disable="!all && !s.has"
                @click="setSizeV2([s], !selectedSizes.some(sz => sz.size === s.size), !!s.count)"
              >
                <span>{{ s.size }} <sup v-if="getCountSizes(s.count, s.countSelected) > 1">{{ getCountSizes(s.count, s.countSelected) > 1 ? `(${getCountSizes(s.count, s.countSelected)} шт)` : '' }}</sup></span>
                <q-badge
                  v-if="s.countSelected"
                  color="red"
                  floating
                >
                  {{ s.countSelected }}
                </q-badge>
              </q-btn>
            </div>
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
                :disable="!selectedSizes.length || !price || totalSum <= 0"
              />
            </div>
          </div>
    
          <!-- Step 2 -->
          <div
            v-else
            class="full-width full-height flex column"
          >
            <InputPlusMinus
              :max="selectedSize.count"
              :model-value="selectedSize.countSelected"
              :label="`Кол-во шт для размера: <b>${selectedSize.size}</b>`"
              class="q-my-auto"
              @update:model-value="onChangeCount"
            />
            <q-separator class="full-width q-my-md" />
            <div class="flex no-wrap q-gap-md">
              <q-btn
                class="button-size"
                color="grey"
                icon="mdi-arrow-left"
                push
                @click="isStepTwo = false"
              />
              <q-btn
                class="button-size"
                color="primary"
                icon="mdi-check"
                push
                @click="setSizeWithCounts"
              />
            </div>
          </div>
        </transition>
      </q-card-section>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import useHelpers from 'src/modules/useHelpers'
import useMoney from 'src/modules/useMoney'
import InputPlusMinus from 'src/components/InputPlusMinus'
import PayMethods from 'src/components/Product/PayMethods.vue'
import PriceList from 'src/components/Product/PriceList.vue'
import AdditionalSettings from 'src/components/Product/AdditionalSettings.vue'
import SwipeToClose from 'src/components/SwipeToClose.vue'
import {
  reactive,
  ref,
  toRefs,
  watch,
  computed
} from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  sizes: {
    type: Array,
    default: () => []
  },
  selected: {
    type: Array,
    default: () => []
  },
  comment: {
    type: String,
    default: null
  },
  all: {
    type: Boolean,
    default: false
  },
  btnSize: {
    type: String,
    default: 'sm',
  },
  title: {
    type: String,
    default: null
  },
  useForSale: {
    type: Boolean,
    default: false
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
  discountPrice: {
    type: Number,
    default: null
  },
  percentageDiscount: {
    type: Boolean,
    default: false
  },
  typeSizes: {
    type: Array,
    default: () => []
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

const emit = defineEmits([
  'submit',
  'update:modelValue'
])

const {
  selected,
  sizes,
  useForSale,
  discountPrice,
  percentageDiscount,
  typeSizes,
  comment
} = toRefs(props)
const commentVal = ref(comment.value)
const selectedSizes = ref([...selected.value])
const selectedSize = ref(null)
const selectedCounts = ref(null)
const isStepTwo = ref(false)
const listSizes = ref([])
const localDiscountPrice = ref(discountPrice.value)
const localPercentageDiscount = ref(percentageDiscount.value)
const payMethods = reactive({})
const price = ref(props.newPrice)

const { showError } = useHelpers()
const { formatPrice } = useMoney()

const totalSum = computed(() => {
  let sum = 0
  if (localPercentageDiscount.value) {
    sum = (price.value - ((price.value / 100) * localDiscountPrice.value)) * selectedSizes.value.length
  } else {
    sum = (price.value * selectedSizes.value.length) - localDiscountPrice.value
  }
  return Math.max(sum, 0)
})

function removeItemOnce(arr, value) {
  const index = arr.map(s => s.size).indexOf(value.size)
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

function setSizeV2(sizes, setter, withCount = false) {
  selectedSize.value = sizes[0]
  if (withCount) {
    isStepTwo.value = true
  } else {
    if (setter) {
      selectedSizes.value.push(...sizes)
    } else {
      for (const size of sizes) {
        selectedSizes.value = removeItemOnce(selectedSizes.value, size)
      }
    }
  }
}

function getCountSizes(count, selectedCount) {
  return count - selectedCount
}

function isSetter(countSelectd, selectdLength) {
  if (countSelectd >= selectdLength) return false
  return true
}

function setSizeWithCounts() {
  isStepTwo.value = false
  listSizes.value = listSizes.value.map(ls => {
    if (ls.size === selectedSize.value.size) {
      return {
        ...ls,
        countSelected: selectedCounts.value !== null ? selectedCounts.value : ls.countSelected 
      }
    }
    return ls
  })
  const newArray = []
  let iterator = 0
  if (useForSale.value) {
    iterator = selectedSize.value.count - selectedCounts.value
  } else {
    iterator = selectedCounts.value === 0 ? selectedSize.value.countSelected : selectedCounts.value
  }
  for (let index = 0; index < iterator; index++) {
    newArray.push(selectedSize.value)
  }
  const setter = isSetter(selectedSize.value.countSelected, selectedCounts.value)
  setSizeV2(newArray, setter, false)
  selectedSize.value = null
  selectedCounts.value = null
}

function close() {
  isStepTwo.value = false
  selectedCounts.value = null
  selectedSize.value = null
  localDiscountPrice.value = null
  localPercentageDiscount.value = false
  if (!useForSale.value) selectedSizes.value = []
  emit('update:modelValue', false)
}

function onChangeCount(count) {
  selectedCounts.value = count
}

function getCountSize(size, sizes) {
  let count = 0
  sizes.forEach(s => {
    if (s.size === size) {
      count += 1
    }
  });
  return count
}

function submit() {
  if (localPercentageDiscount.value && Number(localDiscountPrice.value) > 100) {
    return showError('Скидка не должна быть больше 100%')
  }
  if (useForSale.value) {
    emit('submit', {
      sizes: selectedSizes.value,
      discount: +localDiscountPrice.value,
      percentageDiscount: localPercentageDiscount.value,
      comment: commentVal.value,
      ...payMethods,
      cashSum: price.value,
    })
  } else {
    let sizesIds = []
    if (selectedSizes.value?.length) {
      let tempObj
      let tempArr = [...sizes.value]
      for (const size of selectedSizes.value) {
        tempArr = tempArr.filter(ta => ta.id !== tempObj?.id)
        tempObj = tempArr.find(s => s.size === size.size)
        if (tempObj !== undefined) {
          sizesIds.push(tempObj.id)
        }
      }
    }
    emit('submit', {
      sizes: sizesIds,
      discount: +localDiscountPrice.value,
      percentageDiscount: localPercentageDiscount.value,
      comment: commentVal.value,
      ...payMethods,
      cashSum: price.value,
    })
  }
  close()
}

function createListSizes(list = []) {
  // Filter only sizes that are actually used in sizes array
  const usedSizes = list.filter(size => 
    sizes.value.some(s => s.size === size)
  )
  
  listSizes.value = usedSizes.map(size => {
    const count = getCountSize(size, sizes.value) > 1 ?
      getCountSize(size, sizes.value) : 0
    return {
      size,
      countSelected: useForSale.value ? count : 0,
      count,
      has: sizes.value.some(s => s.size === size)
    }
  })
}

function onChangePayMethods(obj) {
  Object.assign(payMethods, obj);
}

function onAdditionalSettingsChange(settings) {
  commentVal.value = settings.comment
  localDiscountPrice.value = settings.discount
  localPercentageDiscount.value = settings.percentageDiscount
}

function onChangePrice(p) {
  price.value = p
}

watch(() => props.modelValue, (val) => {
  if (val) {
    localDiscountPrice.value = discountPrice.value
    localPercentageDiscount.value = percentageDiscount.value
    price.value = props.newPrice
    selectedSizes.value = [...selected.value]
    createListSizes(typeSizes.value.map(ts => ts.size) || [])
  }
})
</script>

<style lang="scss">
  .btn-sizes {
    &_menu {
      width: 300px !important;
      height: auto;
      overflow: hidden;
    }

    &_list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      span {
        white-space: nowrap;
        line-height: normal;
      }
    }
  }

  .btn-sizes-btn {
    min-width: 0;
    flex: 0 1 auto;
    
    .q-btn__content {
      .block {
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 55px;
      }
    }
  }

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

  .slide-fade-enter-active {
    transition: all 0.2s ease-in-out;
  }

  .slide-fade-leave-active {
    transition: all 0.2s ease-in-out;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(-20px);
    opacity: 0;
  }

  .total-sum {
    border-radius: var(--border-radius-xs);
  }
</style>
