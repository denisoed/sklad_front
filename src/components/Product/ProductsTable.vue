<template>
  <q-table
    :rows="products"
    :columns="columns"
    row-key="id"
    flat
    separator="cell"
    :pagination="{ rowsPerPage: 0 }"
    hide-pagination
    class="statistic-table full-width q-mb-sm border-radius-sm"
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
          <div class="text-weight-medium">{{ props.row.name }}</div>
          <div v-if="props.row.color" class="flex items-center q-gutter-xs q-mt-xs">
            <span class="text-caption text-grey-6">Цвет:</span>
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
            <div v-if="props.row.withDiscount" class="text-weight-bold text-red">
              <div v-if="props.row.withDiscount" class="text-caption text-strike text-grey-6">
                <PriceFormatter :value="props.row.newPrice" />
              </div>
              <PriceFormatter :value="props.row.discountPrice" />
            </div>
            <div v-else class="text-weight-bold">
              <PriceFormatter :value="props.row.newPrice" />
            </div>
          </div>
        </q-td>

        <!-- Actions -->
        <q-td key="actions" :props="props" @click.stop>
          <div class="flex flex-row no-wrap q-gutter-md justify-center">
            <!-- View Product -->
            <q-btn
              v-permissions="{ permissions: [CAN_UPDATE_PRODUCT], skladId: props.row?.sklad?.id }"
              round
              push
              size="sm"
              icon="mdi-eye"
              text-color="primary"
              :to="`/sklad/${props.row?.sklad?.id}/product/${props.row.id}`"
            />
            
            <!-- Add to Basket -->
            <div v-permissions="{ permissions: [CAN_SELL_PRODUCT], skladId: props.row?.sklad?.id }">
              <ModalCountToBucket
                v-if="props.row.useNumberOfSizes"
                :max="props.row.countSizes"
                @submit="$emit('addCountToBucket', props.row, $event)"
              >
                <q-btn
                  push
                  round
                  size="sm"
                  icon="mdi-basket-plus-outline"
                  text-color="deep-orange"
                />
              </ModalCountToBucket>
              
              <ModalSizesToBucket
                v-else
                :sizes="props.row.sizes"
                :type-sizes="props.row?.typeSize?.list || []"
                @submit="$emit('addSizesToBucket', props.row, $event)"
              >
                <q-btn
                  round
                  push
                  size="sm"
                  icon="mdi-basket-plus-outline"
                  text-color="deep-orange"
                />
              </ModalSizesToBucket>
            </div>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import ModalSizesToBucket from 'src/components/ModalSizesToBucket.vue'
import ModalCountToBucket from 'src/components/ModalCountToBucket.vue'
import ColorDisplay from 'src/components/ColorDisplay.vue'
import PriceFormatter from 'src/components/PriceFormatter.vue'
import SizeCount from 'src/components/SizeCount.vue'
import {
  CAN_SELL_PRODUCT,
  CAN_UPDATE_PRODUCT
} from 'src/permissions'

export default defineComponent({
  name: 'ProductsTable',
  components: {
    ModalSizesToBucket,
    ModalCountToBucket,
    ColorDisplay,
    PriceFormatter,
    SizeCount
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
    const router = useRouter()
    const highlightRowId = ref(null)
    
    const goToProduct = (product) => {
      if (product?.sklad?.id && product?.id) {
        router.push(`/sklad/${product.sklad.id}/product/${product.id}`)
      }
    }
    
    const columns = [
      {
        name: 'select',
        label: '',
        field: 'select',
        align: 'center',
        style: 'width: 50px'
      },
      {
        name: 'image',
        label: 'Картинка',
        field: 'image',
        align: 'center',
        style: 'width: 60px'
      },
      {
        name: 'name',
        label: 'Название',
        field: 'name',
        align: 'left',
        sortable: true
      },
      {
        name: 'sizes',
        label: 'Размеры/Кол-во',
        field: 'sizes',
        align: 'left'
      },
      {
        name: 'price',
        label: 'Цена',
        field: 'price',
        align: 'left',
        style: 'width: 120px'
      },
      {
        name: 'actions',
        label: 'Действия',
        field: 'actions',
        align: 'center',
        style: 'width: 120px'
      }
    ]

    return {
      columns,
      highlightRowId,
      goToProduct,
      CAN_SELL_PRODUCT,
      CAN_UPDATE_PRODUCT
    }
  }
})
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
  
  :deep(.q-table tbody tr:hover) {
    background-color: rgba(var(--q-primary-rgb), 0.1);
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