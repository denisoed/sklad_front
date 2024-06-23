<template>
  <router-link to="/statistic" class="chart-card q-pa-md block-bg" v-vibrate>
    <div class="text-subtitle2 text-grey">{{ title }}</div>
    <div class="flex items-center text-h5 text-bold">
      <q-spinner v-if="loading" size="20px" color="primary" class="chart-card_loader" />
      <span v-else>{{ body }}</span>
    </div>
    <div class="text-grey text-lowercase">{{ descr }}</div>
  </router-link>
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'ChartCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    body: {
      type: String,
      default: ''
    },
    descr: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
})
</script>

<style lang="scss" scoped>
.chart-card {
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  white-space: nowrap;

  &_loader {
    margin: 6px 0;
  }
}
</style>
