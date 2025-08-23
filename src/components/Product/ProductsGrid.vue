<template>
  <div>
    <CardProduct
      v-for="(p, i) of products"
      :key="`${p.id}-${i}`"
      :id="p.id"
      :name="p.name"
      :orig-price="p.origPrice"
      :new-price="p.newPrice"
      :discount-price="p.discountPrice"
      :discount-days="p.discountDays"
      :with-discount="p.withDiscount"
      :color="p.color"
      :sizes="p.sizes"
      :image="p.image?.url"
      :count-sizes="p.countSizes"
      :sklad="p?.sklad"
      :use-number-of-sizes="p.useNumberOfSizes"
      @open-image-preview="$emit('openImagePreview', p.image?.url)"
      class="q-mb-md"
    >
      <div class="flex column full-height">
        <q-btn
          text-color="primary"
          @click="onEdit"
          round
          push
          size="md"
          class="q-mb-md"
          :to="`/sklad/${p?.sklad?.id}/product/${p.id}`"
        >
          <q-icon
            name="mdi-eye"
          />
        </q-btn>
        <div v-permissions="{ permissions: [CAN_SELL_PRODUCT], skladId: p?.sklad?.id }">
          <q-btn
            v-if="p.useNumberOfSizes"
            round
            push
            icon="mdi-basket-plus-outline"
            text-color="deep-orange"
            @click="$emit('openCountModal', p)"
          />
          <q-btn
            v-else
            round
            push
            icon="mdi-basket-plus-outline"
            text-color="deep-orange"
            @click="$emit('openSizesModal', p)"
          />
        </div>
        <q-checkbox
          v-permissions="{ permissions: [CAN_UPDATE_PRODUCT], skladId: p?.sklad?.id }"
          :model-value="bulkProducts"
          @update:model-value="$emit('update:bulkProducts', $event)"
          :val="p"
          class="q-mt-auto"
        />
      </div>
    </CardProduct>
  </div>
</template>

<script setup>
import CardProduct from 'src/components/Product/CardProduct.vue'
import {
  CAN_SELL_PRODUCT,
  CAN_UPDATE_PRODUCT
} from 'src/permissions'
import { useBulkStore } from 'src/stores/bulk'
import { storeToRefs } from 'pinia'


const bulkStore = useBulkStore()
const { bulkProducts } = storeToRefs(bulkStore)

defineOptions({
  name: 'ProductsGrid'
})

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  bulkProducts: {
    type: Array,
    default: () => []
  }
})

const emits = defineEmits([
  'openImagePreview',
  'addCountToBucket',
  'addSizesToBucket',
  'update:bulkProducts',
  'openCountModal',
  'openSizesModal'
])
</script> 