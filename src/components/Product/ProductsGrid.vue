<template>
  <div>
    <CardProduct
      v-for="(p, i) of products"
      :key="i"
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
          color="primary"
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
          <ModalCountToBucket
            v-if="p.useNumberOfSizes"
            :max="p.countSizes"
            :prices="p.prices"
            :withDiscount="p.withDiscount"
            :discount-price="p.discountPrice"
            :new-price="p.newPrice"
            @submit="$emit('addCountToBucket', p, $event)"
          >
            <q-btn
              round
              push
              icon="mdi-basket-plus-outline"
              text-color="deep-orange"
            />
          </ModalCountToBucket>
          <ModalSizesToBucket
            v-else
            :sizes="p.sizes"
            :type-sizes="p?.typeSize?.list || []"
            @submit="$emit('addSizesToBucket', p, $event)"
          >
            <q-btn
              round
              push
              icon="mdi-basket-plus-outline"
              text-color="deep-orange"
            />
          </ModalSizesToBucket>
        </div>
        <q-checkbox
          :model-value="bulkProducts"
          @update:model-value="$emit('update:bulkProducts', $event)"
          :val="p"
          class="q-mt-auto"
        />
      </div>
    </CardProduct>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import CardProduct from 'src/components/CardProduct.vue'
import ModalSizesToBucket from 'src/components/ModalSizesToBucket.vue'
import ModalCountToBucket from 'src/components/ModalCountToBucket.vue'
import {
  CAN_SELL_PRODUCT,
  CAN_UPDATE_PRODUCT
} from 'src/permissions'

export default defineComponent({
  name: 'ProductsGrid',
  components: {
    CardProduct,
    ModalSizesToBucket,
    ModalCountToBucket
  },
  props: {
    products: {
      type: Array,
      default: () => []
    },
    bulkProducts: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'openImagePreview',
    'addCountToBucket',
    'addSizesToBucket',
    'update:bulkProducts'
  ],
  setup() {
    return {
      CAN_SELL_PRODUCT,
      CAN_UPDATE_PRODUCT
    }
  }
})
</script> 