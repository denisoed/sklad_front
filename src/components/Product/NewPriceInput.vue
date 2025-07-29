<template>
  <div class="new-price-input">
    <div class="q-mb-md">
      <InputPrice
        :model-value="retailPrice"
        label="Розничная цена за 1 шт"
        hint="Можно указать позже"
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
          label="Доп. розничные цены"
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
              label="Название"
              class="full-width"
              @update:model-value="(value) => onAdditionalPriceNameChange(index, value)"
            />
            <InputPrice
              v-model="price.price"
              label="Цена"
              clear
              :icon="false"
              class="full-width"
              @update:model-value="(value) => onAdditionalPriceValueChange(index, value)"
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
        
        <!-- Кнопка добавления новой цены -->
        <q-btn
          icon="mdi-plus"
          label="Добавить цену"
          color="primary"
          push
          class="full-width"
          @click="addAdditionalPrice"
        />
      </div>
    </div>

    <!-- Диалог с информацией о дополнительных ценах -->
    <q-dialog v-model="showInfoDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Доп. розничные цены</div>
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
          <p class="text-subtitle2">
            Доп. розничные цены - позволяют указать различные варианты розничных цен для одного товара. Например,
          </p>
          <ul class="q-mt-md">
            <li>Цена для постоянных клиентов</li>
            <li>Цена после 18:00</li>
            <li>И другие варианты</li>
          </ul>
          <p class="text-body2 q-mt-md text-grey-5">
            Это поможет вам лучше управлять ценообразованием и предлагать разные условия для разных категорий покупателей.
          </p>
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
import InputPrice from 'src/components/InputPrice.vue'

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