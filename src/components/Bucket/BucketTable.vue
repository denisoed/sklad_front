<template>
  <q-table
    :rows="bucketProducts"
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
            :model-value="checkedSaleProducts"
            @update:model-value="$emit('update:checkedSaleProducts', $event)"
            :val="props.row"
          />
        </q-td>
        
        <!-- Image -->
        <q-td key="image" :props="props" @click.stop>
          <q-avatar 
            v-if="props.row.product?.image?.url" 
            size="40px" 
            class="cursor-pointer"
            @click="$emit('openImagePreview', props.row.product?.image?.url)"
          >
            <q-img 
              :src="props.row.product?.image?.url"
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
          <div class="text-caption text-grey-6">#{{ props.row.product?.id }}</div>
          <div class="text-weight-medium">{{ props.row.product?.name }}</div>
          <div v-if="props.row.product?.color" class="flex items-center q-gutter-xs q-mt-xs">
            <span class="text-caption text-grey-6">Цвет:</span>
            <ColorDisplay :color="props.row.product?.color" size="16px" />
          </div>
        </q-td>

        <!-- Sizes/Count -->
        <q-td key="sizes" :props="props" class="cursor-pointer" @click="goToProduct(props.row)">
          <div v-if="props.row.product?.useNumberOfSizes">
            {{ props.row.countSizes }} шт
          </div>
          <SizeCount v-else :sizes="props.row.sizes" />
        </q-td>

        <!-- Price -->
        <q-td key="price" :props="props" class="cursor-pointer" @click="goToProduct(props.row)">
          <div class="price-column">
            <div class="text-weight-bold">
              <PriceFormatter
                :value="props.row.cashSum"
              />
            </div>
            <div v-if="props.row.discount" class="text-caption text-red">
              Скидка: 
              <template v-if="props.row.percentageDiscount">
                {{ props.row.discount }}%
              </template>
              <template v-else>
                <PriceFormatter :value="props.row.discount" />
              </template>
            </div>
          </div>
        </q-td>

        <!-- Payment Method -->
        <q-td key="payment" :props="props" class="cursor-pointer" @click="goToProduct(props.row)">
          <div class="payment-column">
            <div v-if="props.row.payCash && props.row.payCard" class="text-caption">
              <div>Нал: <PriceFormatter :value="props.row.cashSum || 0" /></div>
              <div>Карт: <PriceFormatter :value="props.row.cardSum || 0" /></div>
            </div>
            <div v-else-if="props.row.payCash" class="text-caption">
              Наличными
            </div>
            <div v-else-if="props.row.payCard" class="text-caption">
              Картой
            </div>
            <div v-else class="text-caption text-grey-6">
              Не указано
            </div>
          </div>
        </q-td>

        <!-- Comment -->
        <q-td key="comment" :props="props" class="cursor-pointer" @click="goToProduct(props.row)">
          <div class="comment-column">
            <span v-if="props.row.comment" class="text-caption">{{ props.row.comment }}</span>
            <span v-else class="text-caption text-grey-6">-</span>
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
              :to="`/product/${props.row.product?.id}`"
            />
            
            <!-- Edit -->
            <ModalCountToBucket
              v-if="props.row.product?.useNumberOfSizes"
              :selected="props.row.countSizes"
              :max="props.row.countSizes"
              :discount="props.row.discount"
              :percentage-discount="props.row.percentageDiscount"
              :cash-sum="props.row.cashSum"
              :card-sum="props.row.cardSum"
              :pay-cash="props.row.payCash"
              :pay-card="props.row.payCard"
              :comment="props.row.comment"
              @submit="onUpdate(props.row, $event)"
            >
              <q-btn
                push
                round
                size="sm"
                icon="mdi-pencil"
                text-color="primary"
              />
            </ModalCountToBucket>
            
            <ModalSizesToBucket
              v-else
              :sizes="props.row.sizes"
              :selected="props.row.sizes"
              :discount="props.row.discount"
              :percentage-discount="props.row.percentageDiscount"
              :type-sizes="props.row?.product?.typeSize?.list || []"
              :cash-sum="props.row.cashSum"
              :card-sum="props.row.cardSum"
              :pay-cash="props.row.payCash"
              :pay-card="props.row.payCard"
              :comment="props.row.comment"
              use-for-sale
              @submit="onUpdate(props.row, $event)"
            >
              <q-btn
                push
                round
                size="sm"
                icon="mdi-pencil"
                text-color="primary"
              />
            </ModalSizesToBucket>

            <!-- Remove -->
            <q-btn
              round
              push
              size="sm"
              icon="mdi-close"
              text-color="deep-orange"
              @click="removeFromBucket(props.row)"
            />
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ModalSizesToBucket from 'src/components/ModalSizesToBucket.vue'
import ModalCountToBucket from 'src/components/ModalCountToBucket.vue'
import ColorDisplay from 'src/components/ColorDisplay.vue'
import PriceFormatter from 'src/components/PriceFormatter.vue'
import SizeCount from 'src/components/SizeCount.vue'

export default defineComponent({
  name: 'BucketTable',
  components: {
    ModalSizesToBucket,
    ModalCountToBucket,
    ColorDisplay,
    PriceFormatter,
    SizeCount
  },
  props: {
    bucketProducts: {
      type: Array,
      default: () => []
    },
    checkedSaleProducts: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'openImagePreview',
    'update',
    'remove',
    'update:checkedSaleProducts'
  ],
  setup(props, { emit }) {
    const router = useRouter()
    const $q = useQuasar()
    const highlightRowId = ref(null)
    
    const goToProduct = (bucketProduct) => {
      if (bucketProduct?.product?.id) {
        router.push(`/product/${bucketProduct.product.id}`)
      }
    }

    function onUpdate(row, event) {
      emit('update', row, event)
    }

    function removeFromBucket(bucketProduct) {
      $q.dialog({
        title: 'Удалить этот товар из корзины?',
        message: 'При удалении товара из корзины, он будет возвращен на склад.',
        cancel: true,
        persistent: true,
        ok: {
          color: 'deep-orange',
          label: 'Удалить',
          push: true
        },
        cancel: {
          color: 'white',
          textColor: 'black', 
          label: 'Отмена',
          push: true
        }
      }).onOk(() => {
        emit('remove', bucketProduct.product, { 
          id: bucketProduct.id, 
          ...(bucketProduct.product?.useNumberOfSizes ? { countSizes: bucketProduct.countSizes } : { sizes: bucketProduct.sizes })
        })
      })
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
        label: 'Фото',
        field: 'image',
        align: 'center',
        style: 'width: 60px'
      },
      {
        name: 'name',
        label: 'Информация',
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
        name: 'payment',
        label: 'Оплата',
        field: 'payment',
        align: 'left',
        style: 'width: 100px'
      },
      {
        name: 'comment',
        label: 'Комментарий',
        field: 'comment',
        align: 'left',
        style: 'width: 120px'
      },
      {
        name: 'actions',
        label: 'Действия',
        field: 'actions',
        align: 'center',
        style: 'width: 150px'
      }
    ]

    return {
      columns,
      highlightRowId,
      goToProduct,
      removeFromBucket,
      onUpdate
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
}

.price-column {
  min-width: 80px;
}

.payment-column {
  min-width: 80px;
}

.comment-column {
  max-width: 120px;
  word-break: break-word;
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