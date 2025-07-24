<template>
  <div>
    <BucketCard
      v-for="(b, i) of bucketProducts"
      :key="i"
      :id="b.id"
      :product-id="b.product?.id"
      :name="b.product?.name"
      :sum-price="getNewPrice(
        b.product,
        b.payCash,
        b.payCard,
        b.cashSum,
        b.cardSum,
        b.percentageDiscount,
        b.discount
      )"
      :color="b.product?.color"
      :image="b.product?.image?.url"
      :sizes="b.sizes"
      :type-sizes="b?.product?.typeSize?.list"
      :discount="b.discount"
      :percentage-discount="b.percentageDiscount"
      :pay-cash="b.payCash"
      :pay-card="b.payCard"
      :card-sum="b.cardSum"
      :cash-sum="b.cashSum"
      :comment="b.comment"
      :loading="b.product?.id === selectedProduct?.id"
      :count-sizes="b.countSizes"
      :sklad="b.sklad"
      :use-number-of-sizes="b.product?.useNumberOfSizes"
      class="q-mb-md"
      @update="update(b, $event)"
      @remove="remove(b.product, $event)"
      @on-checked="onChecked"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import BucketCard from 'src/components/BucketCard.vue'
import { getNewPrice } from './helpers'

export default defineComponent({
  name: 'BucketGrid',
  components: {
    BucketCard
  },
  props: {
    bucketProducts: {
      type: Array,
      default: () => []
    },
    selectedProduct: {
      type: Object,
      default: null
    }
  },
  emits: [
    'update',
    'remove',
    'on-checked'
  ],
  setup(props, { emit }) {
    function update(item, payload) {
      emit('update', item, payload)
    }

    function remove(product, payload) {
      emit('remove', product, payload)
    }

    function onChecked(product) {
      emit('on-checked', product)
    }

    return {
      getNewPrice,
      update,
      remove,
      onChecked
    }
  }
})
</script> 