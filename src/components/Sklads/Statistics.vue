<template>
  <div class="container items-start">
    <h6 class="text-subtitle1 q-mt-md q-mb-sm">Отчеты по всем складам</h6>
    <SwitchTabs :tabs="TABS" :selected-tab="2" @on-change="onChange" />
    <div class="flex full-width no-wrap q-gap-md q-my-md">
      <ChartCard
        class="full-width"
        :title="$t('Statistics_8')"
        :body="priceTotal"
        :descr="`за ${selected.label}`"
        :loading="loadingActivities"
      />
      <ChartCard
        class="full-width"
        :title="$t('Statistics_15')"
        :body="`${soldCount}шт`"
        :descr="`за ${selected.label}`"
        :loading="loadingActivities"
      />
    </div>
    <LineChart :categories="lineChartCategories" :series="lineChartSeries" />
  </div>
</template>

<script>
import { computed, defineComponent, ref, toRefs, watch } from 'vue'
import ChartCard from 'src/components/Charts/ChartCard.vue'
import LineChart from 'src/components/Charts/LineChart.vue'
import SwitchTabs from 'src/components/SwitchTabs.vue'
import moment from 'moment'
import { FILTER_FORMAT, DAY, WEEK, MONTH, YEAR } from 'src/config'
import useStatistics from 'src/modules/useStatistics'
import useDate from 'src/modules/useDate'

const TABS = [
  {
    label: $t('Statistics_37'),
    value: DAY
  },
  {
    label: $t('Statistics_41'),
    value: WEEK
  },
  {
    label: $t('Statistics_45'),
    value: MONTH
  }
]

export default defineComponent({
  name: 'SkladsStatistics',
  components: {
    ChartCard,
    SwitchTabs,
    LineChart,
  },
  props: {
    ids: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const { ids } = toRefs(props)
    const selected = ref(TABS[2])
    const {
      loadActivities,
      soldCount,
      loadingActivities,
      listActivities,
      priceTotal
    } = useStatistics()
    const { getCurrentMonth, getCurrentWeek } = useDate()

    function load(params) {
      if (ids.value?.length) {
        const defaultParams = { dates: getCurrentMonth() }
        const where = {
          sklad: ids.value,
          ...(params || defaultParams)
        }
        loadActivities(where)
      }
    }

    function onChange(val) {
      selected.value = TABS.find(t => t.value === val)
      let p = {}
      if (val === MONTH) {
        p = { dates: getCurrentMonth() }
      } else if (val === WEEK) {
        p = { dates: getCurrentWeek() }
      } else if (val === YEAR) {
        p = { created_at_gte: moment().startOf(YEAR).format(FILTER_FORMAT) }
      } else {
        p = { dates: [moment().startOf(DAY).format(FILTER_FORMAT)] }
      }
      setTimeout(() => {
        load(p)
      }, 300);
    }

    const lineChartCategories = Array.from({ length: moment().daysInMonth() }, (_, i) => moment().startOf('month').add(i, 'days').format(FILTER_FORMAT))
    const lineChartSeries = computed(() => {
      return [
        {
          name: $t('Statistics_107'),
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

    watch(ids, (val) => {
      if (val?.length) {
        load()
      }
    }, {
      immediate: true
    })
    
    return {
      TABS,
      onChange,
      priceTotal,
      soldCount,
      selected,
      loadingActivities,
      lineChartCategories,
      lineChartSeries,
      listActivities,
    }
  }
})
</script>
