<template>
  <div>
    <div @click="mainMenu = true">
      <slot />
    </div>
    <q-dialog
      :model-value="mainMenu"
      position="bottom"
      @update:model-value="close"
    >
      <q-card style="width: 350px">
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
              class="full-width q-mt-sm"
            >
              <div class="full-width full-height flex column q-mb-md">
                <q-input
                  v-model="commentVal"
                  outlined
                  class="full-width"
                  dense
                  label="Комментарий"
                />
              </div>

              <div class="flex no-wrap items-center q-gap-sm q-mb-md">
                <InputPrice
                  v-model="_discount"
                  label="Скидка"
                  clear
                  :color="_discount && 'white'"
                  :bg-color="_discount && 'primary'"
                  dense
                  class="full-width"
                  :icon="_percentageDiscount ? 'mdi-percent' : 'mdi-cash-multiple'"
                />
                <SwitchTabs
                  :tabs="DISCOUNT_TABS"
                  class="discount-tabs"
                  :selected-tab="_percentageDiscount"
                  @on-change="_percentageDiscount = $event"
                />
              </div>
              <p class="q-mb-sm">Способ оплаты</p>
              <PayMethods
                class="q-mb-md"
                @on-change="onChangePayMethods"
                :cash-sum="cashSum"
                :card-sum="cardSum"
                :pay-card="payCard"
                :pay-cash="payCash"
              />
              <p class="q-mb-sm">Размеры</p>
              <div
                class="btn-sizes_list"
              >
                <q-btn
                  v-for="(s, i) of listSizes"
                  :key="i"
                  style="width:30%;height:50px;"
                  :color="!all && !s.has ? 'grey' : 'primary'"
                  :label="s.size"
                  :outline="!selectedSizes.some(sz => sz.size === s.size)"
                  push
                  class="full-width btn-sizes-btn"
                  :disable="!all && !s.has"
                  @click="setSizeV2([s], !selectedSizes.some(sz => sz.size === s.size), !!s.count)"
                >
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
                :label="`Кол-во пар для размера <b>${selectedSize.size}</b>`"
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
    </q-dialog>
  </div>
</template>

<script>
import useHelpers from 'src/modules/useHelpers'
import InputPlusMinus from 'src/components/InputPlusMinus'
import InputPrice from 'src/components/InputPrice'
import PayMethods from 'src/components/Product/PayMethods.vue'
import SwitchTabs from 'src/components/SwitchTabs.vue'
import {
  defineComponent,
  reactive,
  ref,
  toRefs,
  watch
} from 'vue'

const DISCOUNT_TABS = [
  {
    icon: 'mdi-cash-multiple',
    value: false
  },
  {
    icon: 'mdi-percent',
    value: true
  },
]

export default defineComponent({
  name: 'ModalSizesToBucket',
  components: {
    InputPlusMinus,
    InputPrice,
    PayMethods,
    SwitchTabs,
  },
  props: {
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
    discount: {
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
    }
  },
  emits: ['submit'],
  setup(props, { emit }) {
    const {
      selected,
      sizes,
      useForSale,
      discount,
      percentageDiscount,
      typeSizes,
      comment
    } = toRefs(props)
    const commentVal = ref(comment.value)
    const selectedSizes = ref([...selected.value])
    const mainMenu = ref(false)
    const selectedSize = ref(null)
    const selectedCounts = ref(null)
    const isStepTwo = ref(false)
    const listSizes = ref([])
    const _discount = ref(discount.value)
    const _percentageDiscount = ref(percentageDiscount.value)
    const payMethods = reactive({})

    const { showError } = useHelpers()

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
      mainMenu.value = false
      isStepTwo.value = false
      selectedCounts.value = null
      selectedSize.value = null
      _discount.value = null
      _percentageDiscount.value = false
      if (!useForSale.value) selectedSizes.value = []
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
      if (_percentageDiscount.value && Number(_discount.value) > 100) {
        return showError('Скидка не должна быть больше 100%')
      }
      if (useForSale.value) {
        emit('submit', {
          sizes: selectedSizes.value,
          discount: +_discount.value,
          percentageDiscount: _percentageDiscount.value,
          comment: commentVal.value,
          ...payMethods
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
          discount: +_discount.value,
          percentageDiscount: _percentageDiscount.value,
          comment: commentVal.value,
          ...payMethods
        })
      }
      close()
    }

    function createListSizes(list = []) {
      listSizes.value = list.map(size => {
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

    watch(mainMenu, (val) => {
      if (val) {
        _discount.value = discount.value
        _percentageDiscount.value = percentageDiscount.value
        createListSizes(typeSizes.value.map(ts => ts.size) || [])
      }
    })

    return {
      setSizeV2,
      selectedSizes,
      mainMenu,
      submit,
      getCountSize,
      isStepTwo,
      close,
      selectedSize,
      onChangeCount,
      setSizeWithCounts,
      listSizes,
      _discount,
      _percentageDiscount,
      onChangePayMethods,
      DISCOUNT_TABS,
      commentVal
    }
  }
})
</script>

<style lang="scss">
  .discount-tabs {
    width: 120px;
    min-width: 120px;
    max-width: 120px;

    .tab-slider--trigger {
      min-width: auto;
      font-size: 18px;
    }
  }

  .btn-sizes {
    &_menu {
      width: 300px !important;
      height: auto;
      overflow: hidden;
    }

    &_list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 8px;
    }
  }

  .btn-sizes-btn {
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
</style>
