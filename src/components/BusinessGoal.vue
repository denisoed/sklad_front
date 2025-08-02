<template>
  <div class="businnes-goal full-width q-pt-md q-mb-xl">
    <div class="container">
      <PageTitle :title="skladName ? skladName : 'Склад'">
        <div>
          <q-card-section class="q-pt-none">
            Это главная страница склада.
          </q-card-section>
        </div>
      </PageTitle>
      <div class="flex column items-center text-white q-mt-md">
        <div class="text-h6">Цель</div>
        <div class="text-h4 text-bold">{{ skladGoal }}</div>
        <div>заработать за год</div>
      </div>
      <div class="businnes-goal_cards flex q-mt-md">
        <ChartCard
          class="businnes-goal_item q-mr-auto"
          title="Касса"
          :body="formattedPriceTotal"
          descr="заработано за год"
          :loading="loadingActivities"
        />
        <ChartCard
          class="businnes-goal_item"
          title="Товары"
          :body="`${soldCount} шт`"
          descr="продано за год"
          :loading="loadingActivities"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import moment from 'moment'
import { computed, onBeforeMount } from 'vue'
import { FILTER_FORMAT, YEAR } from 'src/config'
import useSklads from 'src/modules/useSklads'
import useMoney from 'src/modules/useMoney'
import useStatistics from 'src/modules/useStatistics'
import PageTitle from 'src/components/PageTitle.vue'
import ChartCard from 'src/components/Charts/ChartCard.vue'
import { useRoute } from 'vue-router'

const {
  sklad,
} = useSklads()
const { params } = useRoute()
const { loadActivities, priceTotal, soldCount, loadingActivities } = useStatistics()
const { formatPrice } = useMoney()

const skladName = computed(() => sklad.value?.name)
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
  background-image: linear-gradient(43deg, var(--q-primary) 0%, #C850C0 46%, #FFCC70 100%);

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
