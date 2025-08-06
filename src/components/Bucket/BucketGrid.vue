<template>
  <BucketCard
    v-for="(b, i) of bucketProducts"
    :key="i"
    :id="b.id"
    :product-id="b.product?.id"
    :name="b.product?.name"
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
    :total-sum="getTotalSum(b)"
    :comment="b.comment"
    :loading="b.product?.id === selectedProduct?.id"
    :count-sizes="b.countSizes"
    :sklad="b.sklad"
    :use-number-of-sizes="b.product?.useNumberOfSizes"
    class="q-mb-md"
    @update="openModalToBucket(b)"
    @remove="remove(b.product, $event)"
    @on-checked="onChecked"
  />
</template>

<script setup>
import BucketCard from 'src/components/Bucket/BucketCard.vue'
import { getTotalSum } from 'src/components/Bucket/utils'

const props = defineProps({
  bucketProducts: {
    type: Array,
    default: () => []
  },
  selectedProduct: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'openModalCountToBucket',
  'openModalSizesToBucket',
  'remove',
  'on-checked'
])

function openModalToBucket(item) {
  if (item.product?.useNumberOfSizes) {
    emit('openModalCountToBucket', item)
  } else {
    emit('openModalSizesToBucket', item)
  }
}

function remove(product, payload) {
  emit('remove', product, payload)
}

function onChecked(product) {
  emit('on-checked', product)
}
</script> 