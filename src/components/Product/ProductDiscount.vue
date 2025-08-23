<template>
  <div
    class="full-width border-radius-sm"
    style="border: 1px solid var(--border-color);"
  >
    <q-checkbox
      :model-value="withDiscount"
      :label="$t('product.setPromotionalPrice')"
      class="full-width"
      @update:model-value="emit('update:withDiscount', $event)"
    />
    <div v-if="withDiscount" class="col-12 q-pa-sm">
      <template v-if="discountDays">
        <p v-if="!isDiscountToday" class="flex items-center no-wrap q-px-sm product-discount-not-today">
          <span class="q-mr-sm">{{ $t('product.noPromotionToday') }}</span>
          <q-icon class="mdi mdi-alert-circle q-ml-auto" color="red-5" size="xs" />
        </p>
        <InputPrice
          :model-value="discountPrice"
          @update:model-value="emit('update:discountPrice', $event)"
          :label="$t('product.promotionalPricePerUnit')"
          clear
          tabindex="7"
          :rules="[
            val => val?.length || $t('validation.promotionalPriceRequired'),
            val => +val !== 0 || $t('validation.promotionalPriceRequired'),
            val => +(val.replace(/[^\d\.\-]/g, '')) < +newPrice || $t('validation.promotionalPriceLowerThanRetail')
          ]"
        />
      </template>
      <div class="flex items-center no-wrap q-px-md q-py-sm product-discount border-radius-sm">
        <div v-if="discountDays" class="q-mr-sm product-discount-dates">
          <p class="q-mr-md q-mb-sm">
            {{ $t('product.promotionDates') }}
          </p>
          <div class="flex q-gap-xs">
            <q-chip
              v-for="(day, i) of discountDays"
              :key="i"
              dense
              outline
              size="12px"
              color="negative"
            >
              <span class="text-white">{{ day }}</span>
            </q-chip>
          </div>
        </div>
        <p v-else class="q-mr-md q-mb-none">{{ $t('product.selectPromotionDates') }}</p>
        <FilterDates
          class="q-ml-auto"
          :with-buttons="false"
          disable-prev-dates
          @on-change="setDiscount"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import InputPrice from 'src/components/InputPrice.vue'
import FilterDates from 'src/components/FilterDates.vue'

defineOptions({
  name: 'ProductDiscount'
})

defineProps({
  withDiscount: {
    type: Boolean,
    required: true
  },
  discountDays: {
    type: Array,
    required: true
  },
  discountPrice: {
    type: String,
    required: true
  },
  newPrice: {
    type: String,
    required: true
  },
  isDiscountToday: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits([
  'update:withDiscount',
  'update:discountDays',
  'update:discountPrice',
  'update:newPrice',
  'update:isDiscountToday'
])

function setDiscount({ dates }) {
  emit('update:discountDays', dates)
}
</script>

<style lang="scss" scoped>
.product-discount {
  background-color: rgba($color: red, $alpha: 0.1);

  &-dates {
    width: 250px;
    max-width: 250px;
  }

  &-not-today {
    color: var(--text-black);
    margin-bottom: 8px;
    background-color: rgba($color: red, $alpha: 0.1);
    border-radius: var(--border-radius-xs);
  }
}
</style>