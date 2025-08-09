<template>
  <q-page>
    <div class="container">
      <PageTitle :title="$t('statistics.reportsAllWarehouses')" />
      <div v-permissions="[READ_STATISTIC_FINANCE]" class="q-mb-lg">
        <h6 class="text-h6 q-mb-md q-mt-none">{{ $t('statistics.finances') }}</h6>
        <div class="statistic-cards q-gap-md">
          <div
            v-for="(c, i) of statisticFinance"
            :key="i"
            class="statistic-card q-pa-md"
            :style="`background-color: ${c.bg};`"
          >
            <div class="statistic-card_title" v-html="c.label" />
            <div class="statistic-card_value">
              <q-spinner
                v-if="statisticFinanceLoading || loadingStatisticActivities"
                size="1em"
              />
              <span v-else>{{ c.value }}</span>
            </div>
          </div>
        </div>
      </div>
      <h6 class="text-h6 q-mb-md q-mt-none">{{ $t('statistics.reports') }}</h6>
      <FilterDates @on-change="load" />
      <div
        class="costs_type flex items-center q-pa-md q-mb-md q-mt-md border-radius-sm"
        style="background-color: rgb(255 0 255 / 8%);"
      >
        <div class="costs_type-label q-ma-none">{{ $t('statistics.cashRegister') }}</div>
        <div class="costs_type-value q-ml-auto">
          <span v-if="priceTotal === 0 || priceTotal">{{ formatPrice(priceTotal) }}</span>
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
        <div class="costs_type-label q-ma-none">{{ $t('statistics.expenses') }}</div>
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
      >
        <div class="costs_type-label q-ma-none">{{ $t('statistics.approximateIncome') }}</div>
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
        :orig-price-total="formatPrice(origPriceTotal)"
        :new-price-total="formatPrice(newPriceTotal)"
        :discount-total="discountTotal"
        @return-product="returnProduct"
      />
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
import useProfile from 'src/modules/useProfile'
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
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'Statistic'
})

const { t: $t } = useI18n()
const $q = useQuasar()

export default defineComponent({
  name: 'StatisticPage',
  components: {
    PageTitle,
    FilterDates,
    StatisticTable
  },
  setup() {
    const { t: $t } = useI18n()
    const { params } = useRoute()
    const { profile } = useProfile()
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
      discountTotal,
      totalRevenue,
      fetchStatisticActivities,
      loadingStatisticActivities
    } = useStatistics()
    const { getCurrentMonth } = useDate()

    const { formatPrice } = useMoney()
    const { sklads } = useSklads()
    const isDateModal = ref(false)
    const showNetPriceTooltip = ref(false)

    const statisticFinance = computed(() => {
      const data = statisticFinanceResult.value?.statisticFinance
      return [
        {
          label: $t('statistics.marginalIncome'),
          value: formatPrice(totalRevenue.value),
          bg: 'rgb(0 255 255 / 8%)'
        },
        {
          label: $t('statistics.expectedIncomeFromGoods'),
          value: formatPrice(data?.incomeFromAvailableProducts),
          bg: 'rgb(0 255 0 / 8%)'
        },
        {
          label: $t('statistics.goodsWholesaleValue'),
          value: formatPrice(data?.sumAvailableProductsWholesalePrice),
          bg: 'rgb(255 255 0 / 8%)'
        },
      ]
    })

    const costsSum = computed(() => {
      const sum = formatPrice(resultListCostsSum.value?.listCostsSum?.sum)
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
      if (!cost) return formatPrice(total)
      return formatPrice(total - cost)
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
              userId: +profile.value?.id || null,
              productId: +activity?.product?.id || null,
              skladId: +activity?.product?.sklad?.id || null,
              telegramId: +profile.value?.telegramId || null,
              skladName: activity?.product?.sklad?.name || null,
              fullname: profile.value?.fullname,
              email: profile.value?.email,
              json: {
                sizes: activity.size?.length ? [activity.size] : [],
                countSizes: activity.countSizes
              },
              action: HISTORY_RETURN
            })
            showSuccess($t('statistics.sizesReturned'))
          }
        } else {
          showError($t('statistics.returnError'))
        }
      } catch {
        showError($t('statistics.returnError'))
      }
    }

    function returnProduct(activity) {
      $q.dialog({
        title: $t('statistics.returnToWarehouse'),
        message: $t('statistics.returnConfirm'),
        cancel: true,
        persistent: true,
        ok: {
          color: 'deep-orange',
          label: $t('statistics.return'),
          push: true
        },
        cancel: {
          color: 'white',
          textColor: 'black',
          label: $t('common.cancel'),
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
      fetchStatisticActivities(where)
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
      formatPrice,
      loadingStatisticActivities
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
