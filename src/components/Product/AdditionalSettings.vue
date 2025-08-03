<template>
  <Dropdown title="Дополнительно" outline>
    <template #icon>
      <q-icon name="mdi-cog-outline" size="sm" class="q-mr-sm" />
    </template>
    <template #body>
      <div class="additional-settings flex column q-gap-sm">
        <q-input
          v-model="localComment"
          outlined
          class="full-width"
          dense
          label="Комментарий"
          clearable
          enterkeyhint="done"
        />
        <div class="flex no-wrap items-center q-gap-sm">
          <InputPrice
            v-model="localDiscountPrice"
            label="Доп. скидка"
            clear
            class="full-width"
            dense
            :icon="localPercentageDiscount ? 'mdi-percent' : 'mdi-cash-multiple'"
          />
          <SwitchTabs
            :tabs="DISCOUNT_TABS"
            :selected-tab="localPercentageDiscount"
            class="discount-tabs"
            @on-change="localPercentageDiscount = $event"
          />
        </div>
      </div>
    </template>
  </Dropdown>
</template>

<script setup>
import {
  ref,
  watch,
  toRefs
} from 'vue'
import InputPrice from 'src/components/InputPrice'
import SwitchTabs from 'src/components/SwitchTabs.vue'
import Dropdown from 'src/components/Dropdown/index.vue'

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