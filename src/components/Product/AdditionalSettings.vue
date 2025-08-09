<template>
  <Dropdown :title="$t('product.additionalSettings')" outline>
    <template #body>
      <q-input
        v-model="comment"
        outlined
        :label="$t('product.additionalComment')"
        class="q-mb-md"
        @update:model-value="$emit('update:comment', $event)"
      />
      
      <InputPrice
        v-model="discountPercent"
        outlined
        :label="$t('product.additionalDiscount')"
        suffix="%"
        class="q-mb-md"
        @update:model-value="$emit('update:discount-percent', $event)"
      />
    </template>
  </Dropdown>
</template>

<script setup>
import {
  ref,
  watch,
  toRefs
} from 'vue'
import { useI18n } from 'vue-i18n'
import InputPrice from 'src/components/InputPrice'
import SwitchTabs from 'src/components/SwitchTabs.vue'
import Dropdown from 'src/components/Dropdown/index.vue'

defineOptions({
  name: 'AdditionalSettings'
})

const { t: $t } = useI18n()

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

const props = defineProps({
  comment: {
    type: String,
    default: null
  },
  discountPrice: {
    type: Number,
    default: null
  },
  percentageDiscount: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['on-change'])

const {
  comment,
  discountPrice,
  percentageDiscount
} = toRefs(props)

const localComment = ref(comment.value)
const localDiscountPrice = ref(discountPrice.value)
const localPercentageDiscount = ref(percentageDiscount.value)

watch([localComment, localDiscountPrice, localPercentageDiscount], ([comment, discount, percentage]) => {
  emit('on-change', {
    comment,
    discount,
    percentageDiscount: percentage
  })
}, { deep: true })

watch(() => props.comment, (val) => {
  localComment.value = val
})

watch(() => props.discountPrice, (val) => {
  localDiscountPrice.value = val
})

watch(() => props.percentageDiscount, (val) => {
  localPercentageDiscount.value = val
})
</script>

<style lang="scss" scoped>
.additional-settings {
  border-radius: var(--border-radius);
}

.discount-tabs {
  width: 120px;
  min-width: 120px;
  max-width: 120px;

  :deep(.tab-slider--trigger) {
    min-width: auto;
    font-size: 18px;
  }
}
</style> 