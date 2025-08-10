<template>
  <div class="businnes-goal full-width q-pt-md q-mb-xl">
    <div class="container">
      <PageTitle :title="pageTitle">
        <div>
          <q-card-section class="q-pt-none">
            {{ $t('businessGoal.mainPageDescription') }}
          </q-card-section>
        </div>
      </PageTitle>
      <div class="flex column items-center text-white q-mt-md">
        <div class="text-h6">{{ $t('businessGoal.goal') }}</div>
        <div class="text-h4 text-bold">{{ skladGoal }}</div>
        <div>{{ $t('businessGoal.earnPerYear') }}</div>
      </div>
      <div class="businnes-goal_cards flex q-mt-md">
        <ChartCard
          class="businnes-goal_item q-mr-auto"
          :title="$t('businessGoal.cash')"
          :descr="$t('businessGoal.earnedPerYear')"
          :body="formattedPriceTotal"
          :loading="loadingActivities"
        />
        <ChartCard
          class="businnes-goal_item"
          :title="$t('businessGoal.products')"
          :descr="$t('businessGoal.soldPerYear')"
          :body="`${soldCount} ${$t('common.pieces')}`"
          :loading="loadingActivities"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import moment from 'moment'
import { computed, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { FILTER_FORMAT, YEAR } from 'src/config'
import useSklads from 'src/modules/useSklads'
import useMoney from 'src/modules/useMoney'
import useStatistics from 'src/modules/useStatistics'
import PageTitle from 'src/components/PageTitle.vue'
import ChartCard from 'src/components/Charts/ChartCard.vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'BusinessGoal'
})

const { t: $t } = useI18n()

const {
  sklad,
} = useSklads()
const { params } = useRoute()
const { loadActivities, priceTotal, soldCount, loadingActivities } = useStatistics()
const { formatPrice } = useMoney()

const pageTitle = computed(() => sklad.value?.name || $t('common.warehouse'))
const skladGoal = computed(() => formatPrice(sklad.value?.goal))
const formattedPriceTotal = computed(() => formatPrice(priceTotal.value))

onBeforeMount(() => {
  const where = {
    sklad: params?.skladId,
    created_at_gte: moment().startOf(YEAR).format(FILTER_FORMAT)
  }
  loadActivities(where)
})
</script>

<style lang="scss" scoped>
.businnes-goal {
  height: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: #4158D0;
  background-image: linear-gradient(43deg, #6a5c6c 0%, #C850C0 46%, #FFCC70 100%);

  :deep(h6) {
    color: white !important;
  }
  :deep(.q-btn) {
    color: var(--q-primary) !important;
    background-color: white !important;
  }

  &_cards {
    margin-bottom: -46px;
  }

  &_item {
    width: calc(50% - 8px);
  }
}
</style>
