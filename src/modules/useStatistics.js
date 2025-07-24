import moment from 'moment'
import { computed } from 'vue'
import useMoney from 'src/modules/useMoney'
import { DISPLAY_FORMAT } from 'src/config'
import { useLazyQuery } from '@vue/apollo-composable'
import {
  LIST_ACTIVITIES,
  STATISTIC_ACTIVITIES,
} from 'src/graphql/types'

const useStatistics = () => {
  const { formatPrice } = useMoney()

  const {
    load,
    result: activitiesResult,
    loading: loadingActivities,
    refetch: refetchActivities
  } = useLazyQuery(LIST_ACTIVITIES)

  const {
    load: loadStatisticActivities,
    result: statisticActivitiesResult,
    loading: loadingStatisticActivities,
    refetch: refetchStatisticActivities
  } = useLazyQuery(STATISTIC_ACTIVITIES)

  const listActivities = computed(() => {
    const activities = activitiesResult.value?.listActivities || []
    return activities.map(a => ({
      ...a,
      created_at: moment(a.created_at).local().format(DISPLAY_FORMAT)
    }));
  })

  const totalRevenue = computed(() => {
    return statisticActivitiesResult.value?.statisticActivities?.totalRevenue || 0
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

  function loadActivities(where) {
    load(
      null,
      {
        where,
        sort: 'created_at:desc',
      },
      { fetchPolicy: 'network-only' }
    )
  }

  function fetchStatisticActivities(where) {
    loadStatisticActivities(
      null,
      { where },
      { fetchPolicy: 'network-only' }
    )
  }

  return {
    priceTotal,
    loadActivities,
    refetchActivities,
    loadingActivities,
    soldCount,
    listActivities,
    origPriceTotal,
    newPriceTotal,
    discountTotal,
    fetchStatisticActivities,
    refetchStatisticActivities,
    loadingStatisticActivities,
    totalRevenue,
  }
}

export default useStatistics
