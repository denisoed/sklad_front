<template>
  <q-page>
    <div class="container">
      <PageTitle title="Отчеты по всем складам" />
      <FilterDates @on-change="load" />
      <div
        class="costs_type flex items-center q-pa-md q-mb-md q-mt-md"
        style="background-color: rgb(255 0 255 / 8%);"
      >
        <div class="costs_type-label q-ma-none">Касса</div>
        <div class="costs_type-value q-ml-auto">
          <span v-if="priceTotal === 0 || priceTotal">{{ priceTotal }}</span>
          <q-spinner
            v-else
            size="1em"
          />
        </div>
      </div>
      <div
        class="costs_type flex items-center q-pa-md q-mb-md hidden"
        style="background-color: rgb(255 0 0 / 8%);"
      >
        <div class="costs_type-label q-ma-none">Расходы</div>
        <div class="costs_type-value q-ml-auto">
          <span v-if="!loadingListCostsSum">{{ costsSum }}</span>
          <q-spinner
            v-if="loadingListCostsSum"
            size="1em"
          />
        </div>
      </div>
      <div
        v-permissions="[READ_NET_PRICE]"
        class="costs_type flex items-center q-pa-md q-mb-md hidden"
        style="background-color: rgb(0 255 0 / 8%);"
        @click="showNetPriceTooltip = true"
        v-vibrate
      >
        <div class="costs_type-label q-ma-none">Примерный доход</div>
        <div class="costs_type-value q-ml-auto">
          <span v-if="netProfit === 0 || netProfit">{{ netProfit }}</span>
          <q-spinner
            v-else
            size="1em"
          />
        </div>
      </div>
      <q-table
        :rows="listActivities"
        :loading="loadingActivities"
        :pagination="pagination"
        row-key="name"
        separator="cell"
        class="statistic-table full-width q-mb-sm"
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
          <q-tr :props="props">
            <q-td class="text-left">
              {{ props.row.name }}
            </q-td>
            <q-td v-permissions="[READ_ORIGINAL_PRICE]" class="text-right">
              {{ props.row.origPrice }}
            </q-td>
            <q-td class="text-right">
              {{ props.row.newPrice }}
            </q-td>
            <q-td class="text-right">
              {{ props.row.discount }}{{ props.row.discount ? props.row.percentageDiscount ? '%' : 'c' : null }}
            </q-td>
            <q-td class="text-right">
              {{ props.row.countSizes ? `${props.row.countSizes} шт` : props.row.size }}
            </q-td>
            <q-td class="text-right">
              {{ props.row.created_at }}
            </q-td>
            <q-td v-permissions="[READ_STATISTIC_TABLE_ACTIONS]" class="text-right">
              <template v-if="props.row?.product?.sklad?.id && props.row?.product?.id">
                <q-btn
                  icon="mdi-eye"
                  round
                  color="primary"
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
                  @click="returnProduct(props.row)"
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
      <div v-permissions="[READ_STATISTIC_FINANCE]">
        <h6 class="text-h6 q-my-md">Финансы</h6>
        <div class="statistic-cards q-gap-md">
          <div
            v-for="(c, i) of statisticFinance"
            :key="i"
            class="statistic-card q-pa-md"
            :style="`background-color: ${c.bg};`"
          >
            <div class="statistic-card_title">{{ c.label }}</div>
            <div class="statistic-card_value">
              <span v-if="!statisticFinanceLoading">{{ c.value }}</span>
              <q-spinner
                v-if="statisticFinanceLoading"
                size="1em"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import {
  computed,
  defineComponent,
  watch,
  ref
} from 'vue'
import { useRoute } from 'vue-router'
import useDate from 'src/modules/useDate'
import useSklads from 'src/modules/useSklads'
import useMoney from 'src/modules/useMoney'
import useHistory from 'src/modules/useHistory'
import useHelpers from 'src/modules/useHelpers'
import PageTitle from 'src/components/PageTitle.vue'
import FilterDates from 'src/components/FilterDates.vue'
import { useLazyQuery, useMutation } from '@vue/apollo-composable'
import useStatistics from 'src/modules/useStatistics'
import {
  STATISTIC_FINANCE,
  LIST_COSTS_SUM,
  UPDATE_PRODUCT,
  DELETE_ACTIVITY
} from 'src/graphql/types'
import {
  HISTORY_RETURN
} from 'src/config'
import {
  READ_NET_PRICE,
  READ_ORIGINAL_PRICE,
  READ_STATISTIC_TABLE_ACTIONS,
  READ_STATISTIC_FINANCE
} from 'src/permissions'

export default defineComponent({
  name: 'StatisticPage',
  components: {
    PageTitle,
    FilterDates
  },
  setup() {
    const $q = useQuasar()
    const { params } = useRoute()
    const {
      result: statisticFinanceResult,
      loading: statisticFinanceLoading,
      load: loadStatisticFinance,
      refetch: refetchStatisticFinance
    } = useLazyQuery(STATISTIC_FINANCE)

    const {
      load: loadListCostsSum,
      result: resultListCostsSum,
      loading: loadingListCostsSum
    } = useLazyQuery(LIST_COSTS_SUM)

    const {
      mutate: updateProduct,
      error: updateProductError,
    } = useMutation(UPDATE_PRODUCT)

    const {
      mutate: deleteActivity,
      error: deleteActivityError,
    } = useMutation(DELETE_ACTIVITY)

    const {
      createHistory,
    } = useHistory()
    const { showSuccess, showError } = useHelpers()
    const {
      loadActivities,
      loadingActivities,
      listActivities,
      refetchActivities,
      priceTotal,
      soldCount,
      origPriceTotal,
      newPriceTotal,
      discountTotal
    } = useStatistics()
    const { getCurrentMonth } = useDate()

    const { format } = useMoney()
    const { sklads } = useSklads()
    const isDateModal = ref(false)
    const showNetPriceTooltip = ref(false)
    const pagination = {
      rowsPerPage: -1,
    }

    const statisticFinance = computed(() => {
      const data = statisticFinanceResult.value?.statisticFinance
      return [
        {
          label: 'Сумма имеющихся товаров по опт цене',
          value: format(data?.sumAvailableProductsWholesalePrice, 'с'),
          bg: 'rgb(255 255 0 / 8%)'
        },
        {
          label: 'Потенциальный доход от имеющихся товаров',
          value: format(data?.incomeFromAvailableProducts, 'с'),
          bg: 'rgb(0 255 0 / 8%)'
        }
      ]
    })

    const costsSum = computed(() => {
      const sum = format(resultListCostsSum.value?.listCostsSum?.sum, 'с')
      return sum
    })

    const netProfit = computed(() => {
      const total = listActivities.value.reduce((prev, next) => {
        const discount = next.percentageDiscount ? ((next.newPrice / 100) * next.discount) : next.discount
        const countUnits = next.countSizes || next.size?.split(', ')?.length || 1
        const sum = (prev + (next.newPrice * countUnits)) - discount
        const result = sum - next.origPrice
        return result <= 0 ? 0 : result
      }, 0);
      const cost = resultListCostsSum.value?.listCostsSum?.sum;
      if (!cost) return format(total, 'c')
      return format(total - cost, 'c')
    })

    const hasSkladId = computed(() => !!params?.skladId);

    async function remove(activity) {
      try {
        const currentSizes = activity.product.sizes.map(s => ({ size: s.size }));
        const activitySizes = (activity.size?.split(', ')).map(size => ({ size }));
        await updateProduct({
          id: activity.product.id,
          data: {
            sizes: [...currentSizes, ...activitySizes],
            countSizes: activity.product.countSizes + activity.countSizes
          }
        })
        if (!updateProductError.value) {
          await deleteActivity({
            id: activity.id
          });
          if (!deleteActivityError.value) {
            refetchActivities()
            refetchStatisticFinance()
            createHistory({
              productId: activity.product.id,
              skladId: activity.product.sklad.id,
              json: {
                sizes: activity.size?.length ? [activity.size] : [],
                countSizes: activity.countSizes
              },
              action: HISTORY_RETURN
            })
            showSuccess('Размеры возвращены!')
          }
        } else {
          showError('Не удалось вернуть. Попробуйте позже.')
        }
      } catch {
        showError('Не удалось вернуть. Попробуйте позже.')
      }
    }

    function returnProduct(activity) {
      $q.dialog({
        title: 'Вернуть товар на склад?',
        message: 'При возврате товара, отчеты будет пересчитаны',
        cancel: true,
        persistent: true,
        ok: {
          color: 'deep-orange',
          label: 'Вернуть',
          push: true
        },
        cancel: {
          color: 'white',
          textColor: 'black', 
          label: 'Отмена',
          push: true
        }
      }).onOk(() => {
        remove(activity);
      })
    }

    function load(dates) {
      const defaultDates = dates || { dates: getCurrentMonth() }
      const where = {
        sklad: params?.skladId || sklads.value?.map(s => s.id) || [],
        ...defaultDates,
      }
      loadActivities(where)
      loadListCostsSum(
        null,
        {
          where
        },
        { fetchPolicy: 'network-only' }
      )
      loadStatisticFinance(
        null,
        {
          where: {
            sklad: params?.skladId
          }
        },
        { fetchPolicy: 'network-only' }
      )
    }

    watch(sklads, (val) => {
      if (val?.length || params?.skladId) {
        load()
      }
    }, {
      immediate: true
    })

    return {
      listActivities,
      loadingActivities,
      isDateModal,
      origPriceTotal,
      newPriceTotal,
      statisticFinance,
      statisticFinanceLoading,
      costsSum,
      loadingListCostsSum,
      pagination,
      netProfit,
      discountTotal,
      priceTotal,
      READ_NET_PRICE,
      READ_ORIGINAL_PRICE,
      READ_STATISTIC_TABLE_ACTIONS,
      READ_STATISTIC_FINANCE,
      load,
      hasSkladId,
      returnProduct,
      params,
      showNetPriceTooltip,
      soldCount
    }
  }
})
</script>

<style lang="scss">
.statistic {
  &-cards {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: nowrap;
  }

  &-card {
    width: 100%;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);

    &_title {
      font-size: 16px;
      color: var(--text-description);
    }

    &_value {
      position: relative;
      font-size: 20px;
      font-weight: bold;
      margin-top: 5px;
    }
  }

  &-table {
    .q-table__top,
    thead tr:first-child th {
      font-weight: bold;
    }
  }
}

.costs_type {
  &-label {
    font-size: 14px;
    color: var(--text-description);
  }

  &-value {
    position: relative;
    font-size: 14px;
    font-weight: bold;
    margin-top: 5px;
  }
}
</style>
