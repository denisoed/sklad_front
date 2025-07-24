<template>
  <q-table
    :rows="listActivities"
    :loading="loadingActivities"
    :pagination="pagination"
    row-key="name"
    separator="cell"
    class="statistic-table full-width q-mb-sm border-radius-sm"
    hide-pagination
    no-data-label="Нет данных"
  >
    <template #header="props">
      <q-tr :props="props">
        <q-th>Название</q-th>
        <q-th v-permissions="[READ_ORIGINAL_PRICE]">Опт Цена</q-th>
        <q-th>Роз Цена</q-th>
        <q-th>Скидка</q-th>
        <q-th>Размеры</q-th>
        <q-th>Дата продажи</q-th>
        <q-th v-permissions="[READ_STATISTIC_TABLE_ACTIONS]" class="text-right">Возврат товара</q-th>
      </q-tr>
    </template>
    <template #body="props">
      <q-tr 
        :props="props" 
        class="cursor-pointer"
        @click="handleRowClick($event, props.row)"
      >
        <q-td class="text-left">
          {{ props.row.name }}
        </q-td>
        <q-td v-permissions="[READ_ORIGINAL_PRICE]" class="text-right">
          <PriceFormatter :value="props.row.origPrice" />
        </q-td>
        <q-td class="text-right">
          <PriceFormatter :value="props.row.newPrice" />
        </q-td>
        <q-td class="text-right">
          <template v-if="props.row.discount && props.row.percentageDiscount">{{ props.row.discount }}%</template>
          <template v-else-if="props.row.discount"><PriceFormatter :value="props.row.discount" />c</template>
          <template v-else>-</template>
        </q-td>
        <q-td class="text-right">
          {{ props.row.countSizes ? `${props.row.countSizes} шт` : props.row.size }}
        </q-td>
        <q-td class="text-right">
          {{ props.row.created_at }}
        </q-td>
        <q-td v-permissions="[READ_STATISTIC_TABLE_ACTIONS]" class="text-right" @click.stop>
          <template v-if="props.row?.product?.sklad?.id && props.row?.product?.id">
            <q-btn
              icon="mdi-eye"
              round
              push
              text-color="primary"
              size="sm"
              class="q-mr-md"
              title="Перейти в товар"
              :to="`/sklad/${props.row?.product?.sklad?.id}/product/${props.row?.product?.id}`"
              v-vibrate
            />
            <q-btn
              icon="mdi-keyboard-return"
              round
              color="deep-orange"
              size="sm"
              title="Возврат товара на склад"
              @click="$emit('return-product', props.row)"
              v-vibrate
            />
          </template>
          <template v-else>
            <span class="text-grey">Удалён со склада</span>
          </template>
        </q-td>
      </q-tr>
    </template>
    <template #bottom>
      <div class="text-subtitle2">Продано единиц: <b>{{ soldCount }}</b></div>
    </template>
    <template #bottom-row>
      <q-tr>
        <q-td class="text-left text-bold">
          Итог
        </q-td>
        <q-td v-permissions="[READ_ORIGINAL_PRICE]" class="text-right text-bold">
          {{ origPriceTotal }}
        </q-td>
        <q-td class="text-right text-bold">
          {{ newPriceTotal }}
        </q-td>
        <q-td class="text-right text-bold">
          {{ discountTotal }}
        </q-td>
        <q-td class="text-right text-bold" />
        <q-td class="text-right text-bold" />
        <q-td v-permissions="[READ_STATISTIC_TABLE_ACTIONS]" class="text-right text-bold" />
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import { defineComponent } from 'vue'
import PriceFormatter from 'src/components/PriceFormatter.vue'
import {
  READ_ORIGINAL_PRICE,
  READ_STATISTIC_TABLE_ACTIONS
} from 'src/permissions'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'StatisticTable',
  components: {
    PriceFormatter
  },
  props: {
    listActivities: {
      type: Array,
      default: () => []
    },
    loadingActivities: {
      type: Boolean,
      default: false
    },
    soldCount: {
      type: Number,
      default: 0
    },
    origPriceTotal: {
      type: String,
      default: ''
    },
    newPriceTotal: {
      type: String,
      default: ''
    },
    discountTotal: {
      type: String,
      default: ''
    }
  },
  emits: ['return-product'],
  setup() {
    const router = useRouter()

    const pagination = {
      rowsPerPage: -1,
    }

    const handleRowClick = (event, row) => {
      if (row?.product?.sklad?.id && row?.product?.id) {
        router.push(`/sklad/${row.product.sklad.id}/product/${row.product.id}`)
      }
    }

    return {
      pagination,
      handleRowClick,
      READ_ORIGINAL_PRICE,
      READ_STATISTIC_TABLE_ACTIONS
    }
  }
})
</script>

<style lang="scss">
.statistic-table {
  .q-table__top,
  thead tr:first-child th {
    font-weight: bold;
  }

  .q-table tbody tr {
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
}
</style> 