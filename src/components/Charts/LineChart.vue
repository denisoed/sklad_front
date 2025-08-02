<template>
  <div class="line-chart block-bg full-width">
    <div class="chart-container">
      <VueApexCharts
        ref="chartRef"
        width="100%"
        height="300px"
        type="area"
        :options="chartOptions"
        :series="series"
      />

      <!-- Custom zoom reset button -->
      <q-btn
        v-if="isZoomed"
        round
        size="sm"
        color="primary"
        icon="mdi-refresh"
        class="zoom-reset-btn"
        @click="resetZoom"
        title="Сбросить зум"
      />
    </div>
  </div>
</template>

<script setup>
import { LocalStorage } from 'quasar'
import { computed, toRefs, ref, onMounted } from 'vue'
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

// Chart reference for accessing ApexCharts methods
const chartRef = ref(null)
const isZoomed = ref(false)

function getThemeMode() {
  const isDark = LocalStorage.getItem(IS_DARK_MODE)
  if (isDark === null) return 'dark'
  return isDark ? 'dark' : 'light'
}

// Reset zoom function
const resetZoom = () => {
  if (chartRef.value && chartRef.value.chart) {
    chartRef.value.chart.resetZoom()
    isZoomed.value = false
  }
}

// Check if chart is zoomed
const checkZoomState = () => {
  if (chartRef.value && chartRef.value.chart) {
    const chart = chartRef.value.chart
    const zoomed = chart.isZoomed && chart.isZoomed()
    isZoomed.value = zoomed
  }
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
        zoom: false,
      }
    },
    legend: {
      show: false
    },
    background: 'var(--block-bg)',
    zoom: {
      enabled: false,
      type: 'x'
    },
    events: {
      zoomed: function(chartContext, { xaxis }) {
        // Check zoom state when zoom event occurs
        setTimeout(() => {
          checkZoomState()
        }, 100)
      },
      selection: function(chartContext, { xaxis }) {
        // Check zoom state when selection occurs
        setTimeout(() => {
          checkZoomState()
        }, 100)
      }
    }
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

// Initialize zoom state check after component mounts
onMounted(() => {
  setTimeout(() => {
    checkZoomState()
  }, 500)
})
</script>

<style lang="scss" scoped>
.line-chart {
  background: var(--block-bg);
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
  
  .chart-container {
    position: relative;
  }
  
  .zoom-reset-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
    }
  }
  
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