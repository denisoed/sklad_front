<template>
  <q-table
    :rows="products"
    :columns="columns"
    row-key="id"
    flat
    separator="cell"
    :pagination="{ rowsPerPage: 0 }"
    hide-pagination
    class="statistic-table block-bg full-width q-mb-sm border-radius-sm"
  >
    <template v-slot:body="props">
      <q-tr
        :props="props"
        :id="props.row.id"
        :class="{ 'table-row-highlight': highlightRowId === props.row.id }"
      >
        <!-- Checkbox -->
        <q-td key="select" :props="props" @click.stop>
          <q-checkbox
            v-permissions="{ permissions: [CAN_UPDATE_PRODUCT], skladId: props.row?.sklad?.id }"
            :model-value="bulkProducts"
            @update:model-value="$emit('update:bulkProducts', $event)"
            :val="props.row"
          />
        </q-td>
        
        <!-- Image -->
        <q-td key="image" :props="props" @click.stop>
          <q-avatar 
            v-if="props.row.image?.url" 
            size="40px" 
            class="cursor-pointer"
            @click="$emit('openImagePreview', props.row.image?.url)"
          >
            <q-img 
              :src="props.row.image?.url"
              spinner-size="sm"
            />
          </q-avatar>
          <q-icon 
            v-else
            name="mdi-image-off"
            size="sm"
            color="grey-5"
          />
        </q-td>
        
        <!-- Name -->
        <q-td key="name" :props="props" class="cursor-pointer" @click="goToProduct(props.row)">
          <div class="text-caption text-grey-6">#{{ props.row.id }}</div>
          <div class="text-weight-medium">{{ props.row.name }}</div>
          <div v-if="props.row.color" class="flex items-center q-gutter-xs q-mt-xs">
            <span class="text-caption text-grey-6">{{ $t('common.color') }}:</span>
            <ColorDisplay :color="props.row.color" size="16px" />
          </div>
        </q-td>

        <!-- Sizes/Count -->
        <q-td key="sizes" :props="props" class="cursor-pointer" @click="goToProduct(props.row)">
          <div v-if="props.row.useNumberOfSizes">
            {{ props.row.countSizes }} шт
          </div>
          <SizeCount v-else :sizes="props.row.sizes" />
        </q-td>

        <!-- Price -->
        <q-td key="price" :props="props" class="cursor-pointer" @click="goToProduct(props.row)">
          <div class="price-column">
            <div
              v-permissions="{ permissions: [READ_ORIGINAL_PRICE], skladId: props.row?.sklad?.id }"
              class="text-grey-6">
              {{ $t('product.originalPrice') }}: <PriceFormatter :value="props.row.origPrice" />
            </div>
            <div v-if="props.row.withDiscount" class="text-weight-bold text-red">
               <div v-if="props.row.withDiscount" class="text-caption text-strike text-grey-6">
                 {{ $t('product.retailPrice') }}: <PriceFormatter :value="props.row.newPrice" />
              </div>
               {{ $t('product.promotionalPricePerUnit') }}: <PriceFormatter :value="props.row.discountPrice" />
            </div>
            <div v-else class="text-weight-bold">
               {{ $t('product.retailPrice') }}: <PriceFormatter :value="props.row.newPrice" />
            </div>
          </div>
        </q-td>

        <!-- Actions -->
        <q-td key="actions" :props="props" @click.stop>
          <div class="flex flex-row no-wrap q-gutter-md justify-center">
            <!-- View Product -->
            <q-btn
              round
              push
              size="sm"
              icon="mdi-eye"
              text-color="primary"
              :to="`/sklad/${props.row?.sklad?.id}/product/${props.row.id}`"
            />
            
            <!-- Add to Basket -->
            <q-btn
              v-permissions="{ permissions: [CAN_SELL_PRODUCT], skladId: props.row?.sklad?.id }"
              round
              push
              size="sm"
              icon="mdi-basket-plus-outline"
              text-color="deep-orange"
              @click="$emit(props.row.useNumberOfSizes ? 'openCountModal' : 'openSizesModal', props.row)"
            />
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ColorDisplay from 'src/components/ColorDisplay.vue'
import PriceFormatter from 'src/components/PriceFormatter.vue'
import SizeCount from 'src/components/SizeCount.vue'
import { CAN_SELL_PRODUCT, CAN_UPDATE_PRODUCT, READ_ORIGINAL_PRICE } from 'src/permissions'

defineOptions({
  name: 'ProductsTable'
})

defineProps({
  products: {
    type: Array,
    default: () => []
  },
  bulkProducts: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'openImagePreview',
  'addCountToBucket',
  'addSizesToBucket',
  'update:bulkProducts',
  'openCountModal',
  'openSizesModal'
])

const { t: $t } = useI18n()
const router = useRouter()

const highlightRowId = ref(null)

const columns = computed(() => [
  { name: 'image', label: $t('statistics.photo'), field: 'image', sortable: false },
  { name: 'info', label: $t('product.information'), field: 'name', sortable: true },
  { name: 'price', label: $t('common.price'), field: 'price', sortable: true },
  { name: 'actions', label: $t('statistics.actions'), field: 'actions', sortable: false }
])

function goToProduct(product) {
  if (product?.sklad?.id && product?.id) {
    router.push(`/sklad/${product.sklad.id}/product/${product.id}`)
  }
}
</script>

<style lang="scss" scoped>
.statistic-table {
  :deep(.q-table__top),
  :deep(.q-table__bottom),
  :deep(.q-table__bottom) .q-table__control {
    display: none;
  }
  
  :deep(.q-table__top),
  :deep(thead tr:first-child th) {
    font-weight: bold;
  }
  
  :deep(.q-table) {
    border-radius: 8px;
    overflow: hidden;
  }
}

.price-column {
  min-width: 80px;
}

.table-row-highlight {
  box-shadow: rgba(var(--q-primary-rgb), 0.6) 0px 0px 3px 3px;
  animation: fade-out 10s forwards;
}

@keyframes fade-out {
  0% {
    box-shadow: rgba(var(--q-primary-rgb), 0.6) 0px 0px 3px 3px;
  }
  100% {
    box-shadow: none;
  }
}
</style>
