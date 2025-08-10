<template>
  <div class="table full-width">
    <FilterDates v-if="isFilters" @on-change="onChange" class="q-mb-md" />
    <q-table
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      row-key="name"
      separator="cell"
      class="table full-width block-bg border-radius-sm"
      :no-data-label="$t('common.noData')"
      :rows-per-page-label="$t('common.recordsPerPage')"
    >
      <template #top-row="props">
        <slot v-bind="props" name="top-row" />
      </template>
      <template #body="props">
        <slot v-bind="props" name="body" />
      </template>
      <template #bottom-row="props">
        <slot v-bind="props" name="bottom-row" />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import {
  onBeforeMount,
} from 'vue'
import FilterDates from 'src/components/FilterDates.vue'

const emit = defineEmits(['on-change'])

const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  isFilters: {
    type: Boolean,
    default: true
  },
})

const pagination = {
  rowsPerPage: 10,
}

function onChange(args) {
  emit('on-change', args)
}

onBeforeMount(() => {
  onChange();
});
</script>

<style lang="scss">
  .table {
    .q-table__top,
    thead tr:first-child th {
      font-weight: bold;
    }
  }
</style>
