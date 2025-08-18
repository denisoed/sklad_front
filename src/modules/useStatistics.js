import { computed } from 'vue'
import useMoney from 'src/modules/useMoney'
import { useStatisticsStore } from 'src/stores/statistics'
import { apolloClient } from 'src/boot/apollo'
import { useI18n } from 'vue-i18n'
import {
  STATISTIC_ACTIVITIES,
  STATISTIC_FINANCE,
} from 'src/graphql/types'
import useActivity from 'src/modules/useActivity'

const useStatistics = () => {
  const { formatPrice } = useMoney()
  const statisticsStore = useStatisticsStore()
  const { t: $t } = useI18n()
  const { listActivities } = useActivity()

  const loadingStatisticActivities = computed(() => statisticsStore.getLoadingStatisticActivities)
  const loadingStatisticFinance = computed(() => statisticsStore.getLoadingStatisticFinance)

  const totalRevenue = computed(() => {
    const statisticActivities = statisticsStore.getStatisticActivities || {}
    return statisticActivities.totalRevenue || 0
  })

  const priceTotal = computed(() => {
    return listActivities.value.reduce((prev, next) => {
      const discount = next.percentageDiscount ? ((next.newPrice / 100) * next.discount) : next.discount
      const countUnits = next.countSizes || next.size?.split(', ')?.length || 1
      const sum = (prev + (next.newPrice * countUnits)) - discount
      return sum
    }, 0);
  })

  const origPriceTotal = computed(() => {
    return listActivities.value.reduce((prev, next) => {
      const countUnits = next.countSizes || next.size?.split(', ')?.length || 1;
      const sum = prev + (next.origPrice * countUnits)
      return sum
    }, 0);
  })

  const newPriceTotal = computed(() => {
    return listActivities.value.reduce((prev, next) => {
      const countUnits = next.countSizes || next.size?.split(', ')?.length || 1;
      const sum = prev + (next.newPrice * countUnits)
      return sum
    }, 0);
  })

  const discountTotal = computed(() => {
    const total = listActivities.value.reduce((prev, next) => {
      const discount = next.percentageDiscount ? ((next.newPrice / 100) * next.discount) : next.discount
      const sum = prev + discount
      return sum
    }, 0);
    return formatPrice(total)
  })

  const soldCount = computed(() => {
    const total = listActivities.value.reduce((prev, next) => {
      const sum = prev + (next.countSizes || next.size?.split(', ')?.length)
      return sum
    }, 0);
    return total
  })

  const statisticFinance = computed(() => {
    const data = statisticsStore.getStatisticFinance
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

  async function fetchStatisticFinance(where) {
    try {
      statisticsStore.setLoadingStatisticFinance(true)
      const { data } = await apolloClient.query({
        query: STATISTIC_FINANCE,
        variables: {
          where,
        },
        fetchPolicy: 'network-only'
      })
      statisticsStore.setStatisticFinance(data?.statisticFinance)
      return data?.statisticFinance
    } catch (error) {
      console.error(error)
    } finally {
      statisticsStore.setLoadingStatisticFinance(false)
    }
  }

  async function fetchStatisticActivities(where) {
    try {
      statisticsStore.setLoadingStatisticActivities(true)
      const { data } = await apolloClient.query({
        query: STATISTIC_ACTIVITIES,
        variables: {
          where,
        },
        fetchPolicy: 'network-only'
      })
      statisticsStore.setStatisticActivities(data?.statisticActivities)
      return data?.statisticActivities
    } catch (error) {
      console.error(error)
    } finally {
      statisticsStore.setLoadingStatisticActivities(false)
    }
  }

  return {
    priceTotal,
    soldCount,
    origPriceTotal,
    newPriceTotal,
    discountTotal,
    fetchStatisticActivities,
    loadingStatisticActivities,
    totalRevenue,
    fetchStatisticFinance,
    loadingStatisticFinance,
    statisticFinance,
  }
}

export default useStatistics
