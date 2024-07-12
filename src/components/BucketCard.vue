<template>
  <div
    class="bucket-card block-bg"
  >
    <div
      v-if="discount"
      class="bucket-card_discount"
    >
      Скидка: {{ discount }}{{ percentageDiscount ? '%' : 'c' }}
    </div>
    <router-link
      class="bucket-card_content"
      :to="`/product/${productId}`"
      v-vibrate
    >
      <div class="bucket-card_info q-mb-sm">
        <q-img
          :src="image"
          spinner-size="md"
          spinner-color="grey"
          class="q-mr-md"
        />
        <div class="full-width flex column items-start">
          <div class="full-width flex justify-between">
            <div class="bucket-card_name q-mr-sm">
              <span class="text-primary">#{{ productId }}</span>
              <p>{{ name }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bucket-card_color full-width flex justify-between">
        <span>Цвет</span>
        <div
          :style="`background-color: ${color};`"
        />
      </div>
      
      <div v-if="sklad" class="bucket-card_sklad full-width flex justify-between q-mr-sm">
        <span>Склад:</span>
        <p>{{ sklad?.name }}</p>
      </div>

      <div v-if="useNumberOfSizes" class="bucket-card_sizes full-width flex justify-between">
        <span>Кол-во:</span>
        <p
          v-if="countSizes"
          class="text-primary"
        >
          {{ countSizes }} шт
        </p>
        <p v-else class="text-deep-orange">Не указано</p>
      </div>

      <div v-else class="bucket-card_sizes full-width flex justify-between">
        <span>Размеры:</span>
        <div v-if="sizes && sizes.length">
          <p
            v-for="(s, i) of sizes"
            :key="i"
          >
            <span>{{ s.size }}</span>
            <span v-if="sizes.length !== (i + 1)">,</span>
          </p>
        </div>
        <p v-else>Не увазаны</p>
      </div>

      <!-- Pay method -->
      <div v-if="payMethod" class="bucket-card_pay-method full-width flex justify-between q-mb-sm">
        <span>Оплата:</span>
        <p>{{ payMethod }}</p>
      </div>

      <div v-if="comment" class="bucket-card_comment full-width flex justify-between q-mb-xs">
        <span>Коммент:</span>
        <p>{{ comment }}</p>
      </div>

      <div class="full-width flex justify-between items-center bucket-card_price ">
        <span class="q-mr-xs">Итог:</span>
        <div class="flex row no-wrap">
          <p>{{ sumPrice }}</p>
        </div>
      </div>

      <q-inner-loading
        :showing="loading"
        size="sm"
      />
    </router-link>
    <div
      class="buttons flex flex-center column justify-between q-px-sm q-py-md"
    >
      <q-btn
        round
        push
        size="sm"
        icon="mdi-close"
        text-color="deep-orange"
        @click="removeFromBucket(useNumberOfSizes ? { countSizes } : { sizes })"
        v-vibrate
      />
      <ModalCountToBucket
        v-if="useNumberOfSizes"
        :selected="countSizes"
        :max="countSizes"
        :discount="discount"
        :percentage-discount="percentageDiscount"
        :cash-sum="cashSum"
        :card-sum="cardSum"
        :pay-cash="payCash"
        :pay-card="payCard"
        :comment="comment"
        @submit="updateSizes"
      >
        <q-btn
          icon="mdi-pencil"
          text-color="primary"
          push
          round
          size="sm"
          mr="auto"
          v-vibrate
        />
      </ModalCountToBucket>
      <ModalSizesToBucket
        v-else
        text-color="primary"
        :sizes="sizes"
        :selected="sizes"
        :discount="discount"
        :percentage-discount="percentageDiscount"
        :type-sizes="typeSizes"
        :cash-sum="cashSum"
        :card-sum="cardSum"
        :pay-cash="payCash"
        :pay-card="payCard"
        :comment="comment"
        use-for-sale
        @submit="updateSizes"
      >
        <q-btn
          icon="mdi-pencil"
          text-color="primary"
          push
          round
          size="sm"
          v-vibrate
        />
      </ModalSizesToBucket>
      <q-checkbox
        v-model="checked"
        flat
        dense
      />
    </div>
  </div>
</template>

<script>
import { useQuasar } from 'quasar'
import {
  computed,
  defineComponent,
  ref,
  toRefs,
  watch
} from 'vue'
import ModalSizesToBucket from 'src/components/ModalSizesToBucket.vue'
import ModalCountToBucket from 'src/components/ModalCountToBucket.vue'
import { READ_ORIGINAL_PRICE } from 'src/permissions'

export default defineComponent({
  name: 'BucketCard',
  components: {
    ModalSizesToBucket,
    ModalCountToBucket,
  },
  props: {
    id: {
      type: String,
      default: null
    },
    comment: {
      type: String,
      default: null
    },
    sklad: {
      type: String,
      default: null
    },
    productId: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    origPrice: {
      type: [String, Number],
      default: null
    },
    newPrice: {
      type: [String, Number],
      default: null
    },
    sizes: {
      type: Array,
      default: () => []
    },
    typeSizes: {
      type: Array,
      default: () => []
    },
    color: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    discount: {
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
    percentageDiscount: {
      type: Boolean,
      default: false
    },
    payCash: {
      type: Boolean,
      default: false
    },
    payCard: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: true
    },
    countSizes: {
      type: Number,
      default: null
    },
    useNumberOfSizes: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update', 'remove', 'on-checked'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const {
      id,
      payCard,
      payCash,
      cardSum,
      cashSum,
      newPrice,
      discount,
      percentageDiscount
    } = toRefs(props)
    const checked = ref(true)

    const payMethod = computed(() => {
      if (payCash.value && payCard.value)
        return `Нал: ${cashSum.value || 0} + Карт: ${cardSum.value || 0}`
      if (payCash.value) return $t('BucketCard_281')
      if (payCard.value) return $t('BucketCard_282')
      return null
    })

    const sumPrice = computed(() => {
      let sum = 0;
      if (payCash.value && payCard.value) {
        sum = ((cashSum.value || 0) + (cardSum.value || 0))
      } else {
        sum = newPrice.value
      }
      return percentageDiscount.value ?
        sum - ((sum / 100) * discount.value) :
          sum - discount.value;
    })

    function updateSizes(payload) {
      emit('update', { id: id.value, ...payload })
    }

    function removeFromBucket(payload) {
      $q.dialog({
        title: $t('BucketCard_304'),
        message: $t('BucketCard_305'),
        cancel: true,
        persistent: true,
        ok: {
          color: 'deep-orange',
          label: $t('BucketCard_310'),
          push: true
        },
        cancel: {
          color: 'white',
          textColor: 'black', 
          label: $t('BucketCard_316'),
          push: true
        }
      }).onOk(() => {
        emit('remove', { id: id.value, ...payload })
      })
    }

    watch(checked, (newValue) => {
      emit('on-checked', { id: id.value, checked: newValue })
    })

    return {
      checked,
      updateSizes,
      removeFromBucket,
      READ_ORIGINAL_PRICE,
      payMethod,
      sumPrice
    }
  }
})
</script>

<style lang="scss" scoped>
.bucket-card {
  display: flex;
  position: relative;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);

  &_discount {
    padding: 2px 6px;
    background-color: red;
    position: absolute;
    border-bottom-right-radius: var(--border-radius);
    top: 0;
    left: 0;
    color: #fff;
    z-index: 10;
    font-size: 12px;
    font-weight: bold;
  }

  p {
    margin-bottom: 0;
  }

  .buttons {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &_content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    padding: 15px;
    position: relative;
  }

  &_sklad {
    span {
      margin-right: 4px;
      color: var(--text-description);
    }
  }

  &_info {
    width: 100%;
    display: flex;

    .q-img {
      width: 70px;
      height: 70px;
      min-width: 70px;
      max-width: 70px;
      background-color: #eee;
      border-radius: 8px;
    }
  }

  &_color {
    span {
      color: var(--text-description);
    }

    > div {
      width: 32px;
      height: 16px;
      border-radius: 3px;
      margin-top: 2px;
      box-shadow: 0px 0px 6px 0 rgba(0, 0, 0, 0.2);
    }
  }

  &_comment {
    background-color: rgba($color: $primary, $alpha: 0.3);
    padding: 1px 4px;
  }

  &_price {
    background-color: rgba($color: red, $alpha: 0.3);
    padding: 1px 4px;
  }

  &_pay-method {
    > span {
      margin-right: 5px;
      color: var(--text-description);
    }

    > p {
      background-color: rgba($color: $primary, $alpha: 0.1);
      padding: 1px 4px;
    }
  }

  &_sizes {
    display: flex;
    align-items: center;

    > span {
      margin-right: 5px;
      color: var(--text-description);
    }

    > p {
      color: var(--text-description);
    }

    > div {
      display: flex;
      align-items: center;
      padding: 0 4px;
      border-radius: 3px;
      border: 1px solid var(--q-primary);

      p {
        color: var(--q-primary-text);
        font-size: 16px;
        margin-right: 5px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
