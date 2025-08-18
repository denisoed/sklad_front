<template>
  <q-page>
    <div class="container">
      <PageTitle :title="$t('statistics.reportsAllWarehouses')" />

      <p class="q-mb-sm text-subtitle2">{{ $t('pages.warehousesLabel') }}</p>
      <MiniTabs
        :list="skladsTabs"
        :selected-id="selectedSkladId"
        scroll-to-active-tab
        class="q-mb-md"
        @on-change="onChangeSklad"
        @long-press="onLongPressSklad"
      />

      <p class="q-mb-sm text-subtitle2">{{ $t('pages.typesLabel') }}</p>
      <MiniTabs
        :list="typeTabs"
        :selected-id="selectedType"
        scroll-to-active-tab
        class="q-mb-lg"
        @on-change="onChangeType"
      />

      <FilterDates @on-change="onChangeDates" class="q-mb-md" />

      <!-- Sales -->
      <SalesTab
        v-if="selectedType === 0"
        @on-return-product="() => fetchSalesTabData(selectedSkladId)"
      />

      <!-- Finance -->
      <FinanceTab v-if="selectedType === 1" />
    </div>
  </q-page>
</template>

<script setup>
import {
  computed,
  ref,
  watch
} from 'vue'
import PageTitle from 'src/components/PageTitle.vue'
import SalesTab from 'src/components/Statistics/Tabs/SalesTab.vue'
import FinanceTab from 'src/components/Statistics/Tabs/FinanceTab.vue'
import MiniTabs from 'src/components/MiniTabs.vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import useSklads from 'src/modules/useSklads'
import useStatistics from 'src/modules/useStatistics'
import useDate from 'src/modules/useDate'
import FilterDates from 'src/components/FilterDates.vue'
import useCosts from 'src/modules/useCosts'

defineOptions({
  name: 'StatisticPage'
})

const { t: $t } = useI18n()
const { sklads } = useSklads()
const router = useRouter()
const { params } = useRoute()
const { getCurrentMonth } = useDate()
const {
  fetchActivities,
  fetchStatisticActivities,
  fetchStatisticFinance
} = useStatistics()
const {
  fetchCosts
} = useCosts()

const selectedType = ref(0)
const selectedSkladId = ref(0)

const ALL_TAB = computed(() => ({
  id: 0,
  name: $t('common.all'),
  color: '#fff'
}))
const typeTabs = computed(() => ([
  {
    id: 0,
    name: 'Продажи',
    color: '#fff',
  },
  {
    id: 1,
    name: $t('statistics.finances'),
    color: '#fff'
  }
]))

const skladsTabs = computed(() => {
  return [ALL_TAB.value, ...sklads.value]
})

function fetchSalesTabData(skladId, dates) {
  const defaultDates = dates || { dates: getCurrentMonth() }
  const where = {
    sklad: skladId || params?.skladId || sklads.value?.map(s => s.id) || [],
    ...defaultDates,
  }
  fetchActivities(where)
}

function fetchFinanceTabDynamicData(skladId, dates) {
  const defaultDates = dates || { dates: getCurrentMonth() }
  const where = {
    sklad: skladId || params?.skladId || sklads.value?.map(s => s.id) || [],
    ...defaultDates,
  }
  fetchCosts(where)
  fetchActivities(where)
}

function fetchFinanceTabStaticData(skladId, dates) {
  const defaultDates = dates || { dates: getCurrentMonth() }
  const where = {
    sklad: skladId || params?.skladId || sklads.value?.map(s => s.id) || [],
    ...defaultDates,
  }
  fetchStatisticFinance({
    sklad: skladId || params?.skladId || sklads.value?.map(s => s.id) || [],
  })
  fetchStatisticActivities(where)
}

function onChangeSklad(id) {
  selectedSkladId.value = id
  if (id !== ALL_TAB.value.id) {
    router.replace({ query: { skladId: id } })
  }
  if (selectedType.value === 0) {
    fetchSalesTabData(id)
  }
  if (selectedType.value === 1) {
    fetchFinanceTabDynamicData(id)
  }
}

function onLongPressSklad(id) {
  if (id !== ALL_TAB.value.id) {
    router.push(`/sklad/${id}`)
  }
}

function onChangeType(id) {
  selectedType.value = id
  if (id === 0) {
    fetchSalesTabData(selectedSkladId.value)
  }
  if (id === 1) {
    fetchFinanceTabStaticData()
    fetchFinanceTabDynamicData(selectedSkladId.value)
  }
}

function onChangeDates(dates) {
  if (selectedType.value === 0) {
    fetchSalesTabData(selectedSkladId.value, dates)
  }
  if (selectedType.value === 1) {
    fetchFinanceTabDynamicData(selectedSkladId.value, dates)
  }
}

watch(sklads, (val) => {
  if (val?.length || params?.skladId) {
    if (selectedType.value === 0) {
      fetchSalesTabData()
    }
    if (selectedType.value === 1) {
      fetchFinanceTabDynamicData()
      fetchFinanceTabStaticData()
    }
  }
}, {
  immediate: true
})
</script>

<style lang="scss" scoped>
:deep(.small-card_color) {
  display: none;
}
</style>
