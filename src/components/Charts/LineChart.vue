<template>
  <div class="line-chart block-bg full-width">
    <apexchart
      width="100%"
      height="300px"
      type="area"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script>
import { LocalStorage } from 'quasar'
import { computed, defineComponent, toRefs } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { IS_DARK_MODE } from 'src/config'

export default defineComponent({
  name: 'LineChart',
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    categories: {
      type: Array,
      default: () => []
    },
    series: {
      type: Object,
      default: () => {}
    },
  },
  setup(props) {
    const { categories } = toRefs(props)

    const chartOptions = computed(() => ({
      theme: {
        mode: LocalStorage.getItem(IS_DARK_MODE) ? 'dark' : 'light'
      },
      colors: ['#BCA37F'],
      chart: {
        id: 'line-chart',
        toolbar: {
          show: false
        },
        legend: {
          show: false
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

    return {
      chartOptions
    }
  }
})
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