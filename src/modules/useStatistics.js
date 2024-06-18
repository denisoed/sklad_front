import moment from 'moment'
import { computed } from 'vue'
import useMoney from 'src/modules/useMoney'
import { DISPLAY_FORMAT } from 'src/config'
import { useLazyQuery } from '@vue/apollo-composable'
import {
  LIST_ACTIVITIES,
} from 'src/graphql/types'

const useStatistics = () => {
  const { format } = useMoney()

  const {
    load,
    result: activitiesResult,
    loading: loadingActivities,
    refetch: refetchActivities
  } = useLazyQuery(LIST_ACTIVITIES)

  const listActivities = computed(() => {
    const activities = activitiesResult.value?.listActivities || []
    return activities.map(a => ({
      ...a,
      created_at: moment(a.created_at).local().format(DISPLAY_FORMAT)
    }));
  })

  const priceTotal = computed(() => {
    const total = listActivities.value.reduce((prev, next) => {
      const discount = next.percentageDiscount ? ((next.newPrice / 100) * next.discount) : next.discount
      const countUnits = next.countSizes || next.size?.split(', ')?.length || 1
      const sum = (prev + (next.newPrice * countUnits)) - discount
      return sum
    }, 0);
    return format(total, 'c')
  })

  const origPriceTotal = computed(() => {
    const total = listActivities.value.reduce((prev, next) => {
      const countUnits = next.countSizes || next.size?.split(', ')?.length || 1;
      const sum = prev + (next.origPrice * countUnits)
      return sum
    }, 0);
    return format(total, 'c')
  })

  const newPriceTotal = computed(() => {
    const total = listActivities.value.reduce((prev, next) => {
      const countUnits = next.countSizes || next.size?.split(', ')?.length || 1;
      const sum = prev + (next.newPrice * countUnits)
      return sum
    }, 0);
    return format(total, 'c')
  })

  const discountTotal = computed(() => {
    const total = listActivities.value.reduce((prev, next) => {
      const discount = next.percentageDiscount ? ((next.newPrice / 100) * next.discount) : next.discount
      const sum = prev + discount
      return sum
    }, 0);
    return format(total, 'c')
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
  }
}

export default useStatistics
