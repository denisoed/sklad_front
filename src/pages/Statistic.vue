<template>
  <q-page>
    <div class="container">
      <PageTitle title="Отчеты по всем складам" />
      <FilterDates @on-change="load" />
      <div
        class="costs_type flex items-center q-pa-md q-mb-md q-mt-md border-radius-sm"
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
      <StatisticTable
        :list-activities="listActivities"
        :loading-activities="loadingActivities"
        :sold-count="soldCount"
        :orig-price-total="format(origPriceTotal, 'c')"
        :new-price-total="format(newPriceTotal, 'c')"
        :discount-total="discountTotal"
        @return-product="returnProduct"
      />
      <div v-permissions="[READ_STATISTIC_FINANCE]">
        <h6 class="text-h6 q-my-md">Финансы</h6>
        <div class="statistic-cards q-gap-md">
          <div
            v-for="(c, i) of statisticFinance"
            :key="i"
            class="statistic-card q-pa-md"
            :style="`background-color: ${c.bg};`"
          >
            <div class="statistic-card_title" v-html="c.label" />
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
import StatisticTable from 'src/components/StatisticTable.vue'
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
    FilterDates,
    StatisticTable
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

    const statisticFinance = computed(() => {
      const data = statisticFinanceResult.value?.statisticFinance
      return [
        {
          label: 'Маржинальный <br> доход',
          value: format(newPriceTotal.value - origPriceTotal.value, 'с'),
          bg: 'rgb(0 255 255 / 8%)'
        },
        {
          label: 'Ожидаемый доход от имеющихся товаров',
          value: format(data?.incomeFromAvailableProducts, 'с'),
          bg: 'rgb(0 255 0 / 8%)'
        },
        {
          label: 'Сумма товаров по оптовой цене',
          value: format(data?.sumAvailableProductsWholesalePrice, 'с'),
          bg: 'rgb(255 255 0 / 8%)'
        },
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
      soldCount,
      format
    }
  }
})
</script>

<style lang="scss">
.statistic {
  &-cards {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  &-card {
    width: 200px;
    min-width: 200px;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

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
