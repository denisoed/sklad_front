<template>
  <div class="sales-tab flex column q-gap-md">
    <FilterDates @on-change="load" />
    <LineChart :categories="lineChartCategories" :series="lineChartSeries" />
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
</template>

<script setup>
import { useQuasar } from 'quasar'
import {
  watch,
  computed,
} from 'vue'
import { useRoute } from 'vue-router'
import useDate from 'src/modules/useDate'
import useSklads from 'src/modules/useSklads'
import useMoney from 'src/modules/useMoney'
import useHistory from 'src/modules/useHistory'
import useHelpers from 'src/modules/useHelpers'
import FilterDates from 'src/components/FilterDates.vue'
import StatisticTable from 'src/components/StatisticTable.vue'
import LineChart from 'src/components/Charts/LineChart.vue'
import { useMutation } from '@vue/apollo-composable'
import useStatistics from 'src/modules/useStatistics'
import useProfile from 'src/modules/useProfile'
import moment from 'moment'
import {
  UPDATE_PRODUCT,
  DELETE_ACTIVITY
} from 'src/graphql/types'
import {
  HISTORY_RETURN
} from 'src/config'
import { useI18n } from 'vue-i18n'
import { FILTER_FORMAT } from 'src/config'

defineOptions({
  name: 'SalesTab'
})

const { t: $t } = useI18n()
const $q = useQuasar()
const { params } = useRoute()
const { profile } = useProfile()

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
  soldCount,
  origPriceTotal,
  newPriceTotal,
  discountTotal
} = useStatistics()
const { getCurrentMonth } = useDate()

const { formatPrice } = useMoney()
const { sklads } = useSklads()

const lineChartCategories = Array.from({ length: moment().daysInMonth() }, (_, i) => moment().startOf('month').add(i, 'days').format(FILTER_FORMAT))
const lineChartSeries = computed(() => {
  return [
    {
      name: $t('businessGoal.cash'),
      data: lineChartCategories.map(d => {
        const values = listActivities.value.filter(a => moment(a.created_at).format(FILTER_FORMAT) === d)
        const total = values.reduce((prev, next) => {
          const countUnits = next.countSizes || next.size?.split(', ')?.length || 1;
          const discount = next.percentageDiscount ? ((next.newPrice / 100) * next.discount) : next.discount
          return (prev + (next.newPrice * countUnits)) - discount
        }, 0);
        return total || 0
      }),
    }
  ]
})

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
      color: 'grey',
      textColor: 'white',
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
}

watch(sklads, (val) => {
  if (val?.length || params?.skladId) {
    load()
  }
}, {
  immediate: true
})
</script>
