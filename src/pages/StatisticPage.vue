<template>
  <q-page>
    <div class="container">
      <PageTitle :title="$t('statistics.reportsAllWarehouses')" />
      <MiniTabs
        :list="typeTabs"
        :selected-id="selectedType"
        scroll-to-active-tab
        class="q-mb-lg q-mt-md"
        @on-change="onChangeType"
      />

      <!-- Sales -->
      <keep-alive>
        <SalesTab v-if="selectedType === 0" />
      </keep-alive>

      <!-- Finance -->
      <keep-alive>
        <FinanceTab v-if="selectedType === 1" v-permissions="[READ_STATISTIC_FINANCE]" />
      </keep-alive>
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

defineOptions({
  name: 'StatisticPage'
})

const { t: $t } = useI18n()

const selectedType = ref(0)

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

function onChangeType(id) {
  selectedType.value = id
}
</script>

<style lang="scss" scoped>
:deep(.small-card_color) {
  display: none;
}
</style>
