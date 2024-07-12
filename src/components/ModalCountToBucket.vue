<template>
  <div>
    <div @click="dialog = true" v-vibrate>
      <slot />
    </div>
    <q-dialog
      v-model="dialog"
      position="bottom"
    >
      <q-card style="width: 350px">
        <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
          <p
            class="full-width text-left text-bold q-mb-none text-subtitle1"
          >
            {{ title || $t('ModalCountToBucket_15')" }}
          </p>

          <q-separator class="full-width q-my-sm" />

          <div class="full-width full-height flex column q-my-sm">
            <q-input
              v-model="commentVal"
              outlined
              class="full-width"
              dense
              :label="$t('ModalCountToBucket_26')"
            />
          </div>

          <div class="full-width flex column q-my-sm">
            <div class="flex no-wrap items-center q-gap-sm q-mb-md">
              <InputPrice
                v-model="_discount"
                :label="$t('ModalCountToBucket_34')"
                clear
                :color="_discount && 'white'"
                :bg-color="_discount && 'primary'"
                class="full-width"
                dense
                :icon="_percentageDiscount ? 'mdi-percent' : 'mdi-cash-multiple'"
              />
              <SwitchTabs
                :tabs="DISCOUNT_TABS"
                :selected-tab="_percentageDiscount"
                class="discount-tabs"
                @on-change="_percentageDiscount = $event"
              />
            </div>
            <p class="q-mb-sm">Способ оплаты</p>
            <PayMethods
              @on-change="onChangePayMethods"
              :cash-sum="cashSum"
              :card-sum="cardSum"
              :pay-card="payCard"
              :pay-cash="payCash"
            />
          </div>
    
          <div class="full-width full-height flex column q-mt-md">
            <InputPlusMinus
              v-model="selectedCount"
              :max="max"
              :label="$t('ModalCountToBucket_63')"
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
                v-vibrate
              />
              <q-btn
                class="button-size"
                color="primary"
                icon="mdi-check"
                push
                @click="submit"
                :disable="!selectedCount"
                v-vibrate
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import InputPlusMinus from 'src/components/InputPlusMinus'
import InputPrice from 'src/components/InputPrice'
import PayMethods from 'src/components/Product/PayMethods.vue'
import SwitchTabs from 'src/components/SwitchTabs.vue'
import {
  defineComponent,
  ref,
  toRefs,
  watch,
  reactive
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
  name: 'ModalCountToBucket',
  components: {
    InputPlusMinus,
    InputPrice,
    PayMethods,
    SwitchTabs
  },
  props: {
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
      default: 0
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
    discount: {
      type: Number,
      default: null
    },
    percentageDiscount: {
      type: Boolean,
      default: false
    },
  },
  emits: ['submit'],
  setup(props, { emit }) {
    const {
      selected,
      comment
    } = toRefs(props)
    const dialog = ref(false)
    const commentVal = ref(comment.value)
    const selectedCount = ref(selected.value)
    const _percentageDiscount = ref(props.percentageDiscount)
    const _discount = ref(props.discount)
    const payMethods = reactive({})

    function close() {
      dialog.value = false
    }

    function submit() {
      emit('submit', {
        countSizes: selectedCount.value,
        percentageDiscount: _percentageDiscount.value,
        discount: _discount.value,
        comment: commentVal.value,
        ...payMethods
      })
      close()
    }

    function onChangePayMethods(obj) {
      Object.assign(payMethods, obj);
    }

    watch(dialog, (val) => {
      if (val) {
        selectedCount.value = selected.value
      }
    })

    return {
      dialog,
      submit,
      selectedCount,
      close,
      _discount,
      _percentageDiscount,
      onChangePayMethods,
      DISCOUNT_TABS,
      commentVal
    }
  }
})
</script>

<style lang="scss" scoped>
.discount-tabs {
  width: 120px;
  min-width: 120px;
  max-width: 120px;

  .tab-slider--trigger {
    min-width: auto;
    font-size: 18px;
  }
}
</style>