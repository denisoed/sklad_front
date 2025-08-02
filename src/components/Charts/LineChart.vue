<template>
  <div class="line-chart block-bg full-width">
    <VueApexCharts
      width="100%"
      height="300px"
      type="area"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup>
import { LocalStorage } from 'quasar'
import { computed, toRefs } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { IS_DARK_MODE } from 'src/config'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  series: {
    type: Object,
    default: () => {}
  },
})

const { categories, series } = toRefs(props)

function getThemeMode() {
  const isDark = LocalStorage.getItem(IS_DARK_MODE)
  if (isDark === null) return 'dark'
  return isDark ? 'dark' : 'light'
}

const chartOptions = computed(() => ({
  theme: {
    mode: getThemeMode()
  },
  colors: ['var(--q-primary)'],
  chart: {
    id: 'line-chart',
    toolbar: {
      show: false,
      tools: {
        zoom: true,
      }
    },
    legend: {
      show: false
    },
    zoom: {
      enabled: false
    },
    background: 'var(--block-bg)'
  },
  grid: {
    borderColor: 'var(--border-color)',
    xaxis: {
      lines: {
        show: true
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    },
  },
  dataLabels: {
    enable: true,
    formatter: function (val) {
      return val || ''
    },
  },
  xaxis: {
    categories: categories.value,
    labels: {
      show: false
    }
  },
}))
</script>

<style lang="scss" scoped>
.line-chart {
  background: var(--block-bg);
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
  
  :deep(.vue-apexcharts) {
    background: var(--block-bg);
    border-radius: var(--border-radius);
    min-height: auto !important;
    max-height: 300px;
    
    .apexcharts-svg {
      border-radius: var(--border-radius);
    }
  }
}
</style>