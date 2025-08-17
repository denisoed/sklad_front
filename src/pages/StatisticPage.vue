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

      <!-- Sales -->
      <SalesTab v-if="selectedType === 0" />

      <!-- Finance -->
      <FinanceTab v-if="selectedType === 1" v-permissions="[READ_STATISTIC_FINANCE]" />
    </div>
  </q-page>
</template>

<script setup>
import {
  computed,
  ref
} from 'vue'
import PageTitle from 'src/components/PageTitle.vue'
import SalesTab from 'src/components/Statistics/Tabs/SalesTab.vue'
import FinanceTab from 'src/components/Statistics/Tabs/FinanceTab.vue'
import MiniTabs from 'src/components/MiniTabs.vue'
import {
  READ_STATISTIC_FINANCE
} from 'src/permissions'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useSklads from 'src/modules/useSklads'

defineOptions({
  name: 'StatisticPage'
})

const { t: $t } = useI18n()
const { sklads } = useSklads()
const router = useRouter()

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
    color: '#fff'
  },
  {
    id: 1,
    name: $t('statistics.finances'),
    color: '#fff',
    disabled: !READ_STATISTIC_FINANCE
  }
]))

const skladsTabs = computed(() => {
  return [ALL_TAB.value, ...sklads.value]
})

function onChangeSklad(id) {
  selectedSkladId.value = id
  selectedType.value = ALL_TAB.value.id
  router.replace({
    query: {
      skladId: id,
    }
  })
  // loadData()
}

function onLongPressSklad(id) {
  router.push(`/sklad/${id}`)
}

function onChangeType(id) {
  selectedType.value = id
}
</script>

<style lang="scss" scoped>
:deep(.small-card_color) {
  display: none;
}
</style>
