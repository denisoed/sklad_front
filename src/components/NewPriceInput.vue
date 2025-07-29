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
      <q-checkbox
        v-model="showAdditionalPrices"
        label="Дополнительные цены"
        class="full-width"
      />
      
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
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  watch,
  toRefs
} from 'vue'
import InputPrice from 'src/components/InputPrice.vue'

export default defineComponent({
  name: 'PriceInput',
  components: {
    InputPrice,
  },
  props: {
    retailPrice: {
      type: Number,
      default: null
    },
    additionalPrices: {
      type: Array,
      default: () => []
    }
  },
  emits: ['on-change'],
  setup(props, { emit }) {
    const { retailPrice, additionalPrices: propAdditionalPrices } = toRefs(props)
    
    const localRetailPrice = ref(retailPrice.value)
    const localAdditionalPrices = ref(propAdditionalPrices.value.length > 0 
      ? [...propAdditionalPrices.value] 
      : [{ name: '', price: null }]
    )
    const showAdditionalPrices = ref(propAdditionalPrices.value.length > 0)

    function onRetailPriceChange(value) {
      localRetailPrice.value = value
      emitChange()
    }

    function onAdditionalPriceChange() {
      emitChange()
    }

    function onAdditionalPriceNameChange(index, value) {
      localAdditionalPrices.value[index].name = value
      emitChange()
    }

    function onAdditionalPriceValueChange(index, value) {
      localAdditionalPrices.value[index].price = value
      emitChange()
    }

    function addAdditionalPrice() {
      localAdditionalPrices.value.push({ name: '', price: null })
      emitChange()
    }

    function removeAdditionalPrice(index) {
      localAdditionalPrices.value.splice(index, 1)
      if (localAdditionalPrices.value.length === 0) {
        localAdditionalPrices.value = [{ name: '', price: null }]
      }
      emitChange()
    }

    function emitChange() {
      const validPrices = localAdditionalPrices.value.filter(price => 
        price.name && price.price
      )
      
      emit('on-change', {
        retailPrice: localRetailPrice.value,
        additionalPrices: validPrices
      })
    }

    // Следим за изменениями пропсов
    watch(retailPrice, (newValue) => {
      localRetailPrice.value = newValue
    })

    watch(propAdditionalPrices, (newValue) => {
      if (newValue.length > 0) {
        localAdditionalPrices.value = [...newValue]
        showAdditionalPrices.value = true
      }
    }, { immediate: true })

    return {
      localRetailPrice,
      localAdditionalPrices,
      showAdditionalPrices,
      onRetailPriceChange,
      onAdditionalPriceChange,
      addAdditionalPrice,
      removeAdditionalPrice
    }
  }
})
</script>

<style lang="scss" scoped>
.new-price-input {
  .q-checkbox {
    line-height: normal;
  }
}
</style> 