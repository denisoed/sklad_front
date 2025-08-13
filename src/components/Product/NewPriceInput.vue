<template>
  <div class="new-price-input">
    <div class="q-mb-md">
      <InputPrice
        :model-value="retailPrice"
        :label="$t('product.retailPricePerPiece')"
        :hint="$t('product.canSpecifyLater')"
        clear
        @update:model-value="onRetailPriceChange"
      />
    </div>
    <div
      class="full-width border-radius-sm q-mb-md"
      style="border: 1px solid var(--border-color);"
    >
      <div class="flex items-center justify-between no-wrap q-pr-sm">
        <q-checkbox
          v-model="showAdditionalPrices"
          :label="$t('product.additionalRetailPrices')"
          class="full-width"
          @update:model-value="onShowAdditionalPricesChange"
        />
        <q-btn
          icon="mdi-information-outline"
          text-color="primary"
          round
          size="sm"
          @click="showInfoDialog = true"
        />
      </div>
      
      <div v-if="showAdditionalPrices" class="q-pa-sm">
        <q-separator class="q-mb-md" />
        <div v-for="(price, index) in localAdditionalPrices" :key="index" class="q-mb-md">
          <div class="flex no-wrap items-center q-gap-sm">
            <q-input
              v-model="price.name"
              outlined
              :debounce="500"
              :label="$t('product.priceName')"
              class="full-width"
              enterkeyhint="done"
              @update:model-value="(value) => onAdditionalPriceNameChange(index, value)"
            />
            <InputPrice
              v-model="price.price"
              :debounce="500"
              :label="$t('common.price')"
              clear
              :icon="false"
              class="full-width"
              @update:modelValue="(value) => onAdditionalPriceValueChange(index, value)"
            />
            <q-btn
              v-if="localAdditionalPrices.length > 1"
              icon="mdi-trash-can-outline"
              color="negative"
              round
              size="sm"
              @click="removeAdditionalPrice(index)"
            />
          </div>
        </div>

        <q-btn
          icon="mdi-plus"
          :label="$t('product.addPrice')"
          color="primary"
          push
          class="full-width"
          @click="addAdditionalPrice"
        />
      </div>
    </div>

    <q-dialog v-model="showInfoDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('product.additionalRetailPrices') }}</div>
          <q-space />
          <q-btn
            round
            push
            color="deep-orange"
            size="sm"
            v-close-popup
            class="absolute-top-right q-mr-md q-mt-md"
          >
            <q-icon
              name="mdi-close"
              color="white"
            />
          </q-btn>
        </q-card-section>

        <q-card-section>
          <p v-html="$t('product.additionalPricesFullDescription')" class="text-subtitle2" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  toRefs
} from 'vue'
import { useI18n } from 'vue-i18n'
import InputPrice from 'src/components/InputPrice.vue'

defineOptions({
  name: 'NewPriceInput'
})

const props = defineProps({
  retailPrice: {
    type: Number,
    default: null
  },
  additionalPrices: {
    type: Array,
    default: () => []
  }
})

const { retailPrice, additionalPrices: propAdditionalPrices } = toRefs(props)

const emit = defineEmits(['on-change'])

const { t: $t } = useI18n()

const localRetailPrice = ref(retailPrice.value)
const localAdditionalPrices = ref(propAdditionalPrices.value.length > 0 
  ? [...propAdditionalPrices.value] 
  : [{ name: '', price: null }]
)
const showAdditionalPrices = ref(propAdditionalPrices.value.length > 0)
const showInfoDialog = ref(false)
const isInternalUpdate = ref(false)

function onRetailPriceChange(value) {
  localRetailPrice.value = value
  emitChange()
}

function onAdditionalPriceNameChange(index, value) {
  const newPrices = [...localAdditionalPrices.value]
  newPrices[index] = { ...newPrices[index], name: value }
  localAdditionalPrices.value = newPrices
  emitChange()
}

function onAdditionalPriceValueChange(index, value) {  
  const newPrices = [...localAdditionalPrices.value]
  newPrices[index] = { ...newPrices[index], price: value }
  localAdditionalPrices.value = newPrices
  emitChange()
}

function addAdditionalPrice() {
  localAdditionalPrices.value = [...localAdditionalPrices.value, { name: '', price: null }]
  emitChange()
}

function removeAdditionalPrice(index) {
  const newPrices = localAdditionalPrices.value.filter((_, i) => i !== index)
  if (newPrices.length === 0) {
    localAdditionalPrices.value = [{ name: '', price: null }]
  } else {
    localAdditionalPrices.value = newPrices
  }
  emitChange()
}

function onShowAdditionalPricesChange(value) {
  if (!value) {
    localAdditionalPrices.value = [{ name: '', price: null }]
  }
  emitChange()
}

function emitChange() {
  isInternalUpdate.value = true
  const validPrices = localAdditionalPrices.value.filter(price => 
    price.name && price.price
  ).map(price => {
    // Remove __typename and handle id properly
    const { __typename, id, ...priceWithoutLocalId } = price
    return id && typeof id === 'number' && id > 0 ? { id, ...priceWithoutLocalId } : priceWithoutLocalId
  })
  
  emit('on-change', {
    retailPrice: localRetailPrice.value,
    additionalPrices: validPrices
  })
  
  setTimeout(() => {
    isInternalUpdate.value = false
  }, 0)
}

watch(retailPrice, (newValue) => {
  localRetailPrice.value = newValue
})

watch(propAdditionalPrices, (newValue) => {
  if (isInternalUpdate.value) {
    return
  }
  
  if (newValue && newValue.length > 0) {
    localAdditionalPrices.value = newValue.map(price => ({ ...price }))
    showAdditionalPrices.value = true
  } else {
    if (localAdditionalPrices.value.length === 0) {
      localAdditionalPrices.value = [{ name: '', price: null }]
    }
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.new-price-input {
  .q-checkbox {
    line-height: normal;
  }
}
</style> 