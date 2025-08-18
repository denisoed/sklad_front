<template>
  <div class="finance-tab flex column q-gap-md">
    <!-- Cash register -->
    <div
      class="costs_type full-width flex items-center q-pa-md border-radius-sm"
      style="background-color: rgba(var(--q-primary-rgb), 0.3);"
    >
      <div class="costs_type-label flex items-center q-gap-sm q-ma-none">
        <q-icon name="mdi-arrow-up" size="xs" />
        <span>
          {{ $t('statistics.cashRegister') }}
        </span>
      </div>
      <div class="costs_type-value q-ml-auto">
        <q-spinner
          v-if="loadingActivities"
          size="1em"
        />
        <span v-else>{{ formatPrice(priceTotal) }}</span>
      </div>
    </div>

    <!-- Expenses -->
    <div
      class="costs_type full-width flex items-center q-pa-md border-radius-sm"
      style="background-color: rgb(255 117 73 / 30%);"
    >
      <div class="costs_type-label flex items-center q-gap-sm q-ma-none">
        <q-icon name="mdi-arrow-down" size="xs" />
        <span>
          {{ $t('statistics.expenses') }}
        </span>
      </div>
      <div class="costs_type-value q-ml-auto">
        <q-spinner
          v-if="costsLoading"
          size="1em"
        />
        <span v-else>{{ formatPrice(costsTotal) }}</span>
      </div>
    </div>

    <!-- Marginal income -->
    <div
      v-if="false"
      class="costs_type full-width flex items-center q-pa-md border-radius-sm"
      style="background-color: rgb(0 255 255 / 8%);"
    >
      <div class="costs_type-label flex items-center q-gap-sm q-ma-none">
        <q-icon name="mdi-wallet" size="xs" />
        <span>
          {{ $t('statistics.marginalIncome') }}
        </span>
      </div>
      <div class="costs_type-value q-ml-auto">
        <q-spinner
          v-if="loadingStatisticActivities"
          size="1em"
        />
        <span v-else>{{ formatPrice(totalRevenue) }}</span>
      </div>
    </div>

    <!-- Chart -->
    <LineChart
      :categories="lineChartCategories"
      :series="lineChartSeries"
      :colors="['var(--q-primary)', 'var(--q-negative)']"
    />

    <!-- Statistic -->
    <div class="flex column full-width">
      <p class="q-mb-sm text-subtitle2">{{ $t('statistics.reports') }}</p>
      <div class="finance-tab-cards full-width q-gap-md">
        <div
          v-for="(c, i) of statisticFinance"
          :key="i"
          class="finance-tab-card q-pa-md"
          :style="`background-color: ${c.bg};`"
        >
          <div class="finance-tab-card_title" v-html="c.label" />
          <div class="finance-tab-card_value">
            <q-spinner
              v-if="statisticFinanceLoading || loadingStatisticActivities"
              size="1em"
            />
            <span v-else>{{ c.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
} from 'vue'
import useMoney from 'src/modules/useMoney'
import LineChart from 'src/components/Charts/LineChart.vue'
import useStatistics from 'src/modules/useStatistics'
import useCosts from 'src/modules/useCosts'
import useActivity from 'src/modules/useActivity'
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { FILTER_FORMAT } from 'src/config'

defineOptions({
  name: 'FinanceTab'
})

const { t: $t } = useI18n()
const { costs, costsTotal, costsLoading } = useCosts()

const {
  priceTotal,
  loadingStatisticActivities,
  statisticFinance,
  totalRevenue
} = useStatistics()
const { listActivities, loadingActivities } = useActivity()

const { formatPrice } = useMoney()

const lineChartCategories = Array.from({ length: moment().daysInMonth() }, (_, i) => moment().startOf('month').add(i, 'days').format(FILTER_FORMAT))
const lineChartSeries = computed(() => {
  return [
    {
      name: $t('statistics.cashRegister'),
      data: lineChartCategories.map(d => {
        const values = listActivities.value.filter(a => moment(a.created_at).format(FILTER_FORMAT) === d)
        const total = values.reduce((prev, next) => {
          const countUnits = next.countSizes || next.size?.split(', ')?.length || 1;
          const discount = next.percentageDiscount ? ((next.newPrice / 100) * next.discount) : next.discount
          return (prev + (next.newPrice * countUnits)) - discount
        }, 0);
        return total || 0
      }),
    },
    {
      name: $t('statistics.expenses'),
      data: lineChartCategories.map(d => {
        const values = costs.value.filter(a => moment(a.created_at).format(FILTER_FORMAT) === d)
        const total = values.reduce((prev, next) => {
          return prev + next.sum
        }, 0);
        return total || 0
      }),
    },
  ]
})
</script>

<style lang="scss" scoped>
:deep(.small-card_color) {
  display: none;
}

.finance-tab {
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
    border-radius: var(--border-radius-sm);
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
