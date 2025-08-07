<template>
  <q-page class="home-page">
    <BusinessGoal />
    <div class="container q-py-md q-gap-md">
      <BlockLink
        v-if="useMinSizes && countProductsWithMinSizes"
        v-permissions="[READ_PRODUCTS_WITH_MIN_SIZES]"
        title="Остатки"
        caption="Товары, которых мало"
        icon="mdi-cart-arrow-up"
        :to="productsWithMinSizesLink"
        accent-color="rgb(255 0 0 / 30%)"
      >
        <q-badge
          class="absolute-top-right q-mt-sm q-mr-sm"
          color="deep-orange"
        >
          {{ countProductsWithMinSizes }}
        </q-badge>
      </BlockLink>
      <BlockLink
        v-permissions="[READ_CATEGORIES]"
        title="Категории"
        caption="Категории товаров"
        icon="mdi-folder-outline"
        :to="categoriesLink"
        accent-color="rgb(255 0 255 / 20%)"
      />
      <BlockLink
        title="Товары"
        caption="Товары на складе"
        icon="mdi-cube-outline"
        :to="productsLink"
        accent-color="rgb(0 0 255 / 20%)"
      />
      <div v-permissions="[READ_HISTORY, READ_SETTINGS]" class="flex no-wrap full-width q-gap-md">
        <BlockLink
          v-permissions="[READ_HISTORY]"
          title="История"
          caption="Активность на складе"
          icon="mdi-history"
          :to="historyLink"
          accent-color="rgb(38 236 227 / 20%)"
        />
        <BlockLink
          v-permissions="[READ_SETTINGS]"
          title="Настройки"
          caption="Настройки склада"
          icon="mdi-cog-outline"
          :to="settingsLink"
          accent-color="rgb(255 95 95 / 20%)"
        />
      </div>
      <BlockLink
        v-permissions="[READ_COST]"
        title="Расходы"
        caption="Траты по складу"
        icon="mdi-cash"
        :to="costsLink"
        accent-color="rgb(255 255 0 / 20%)"
      />
    </div>
    <QRModal :opened="qrModalOpened" @close="qrModalOpened = false" />
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import useSklads from 'src/modules/useSklads'
import BlockLink from 'src/components/BlockLink.vue'
import QRModal from 'src/components/QRModal.vue'
import BusinessGoal from 'src/components/BusinessGoal.vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from 'src/stores/products'
import {
  READ_HISTORY,
  READ_SETTINGS,
  CAN_ADD_PRODUCT,
  READ_STATISTIC,
  READ_COST,
  READ_PRODUCTS_WITH_MIN_SIZES,
  READ_CATEGORIES
} from 'src/permissions'

defineOptions({
  name: 'SkladPage',
})

const { sklad } = useSklads()
const { params } = useRoute()

const qrModalOpened = ref(false)

const productsStore = useProductsStore()
const useMinSizes = computed(() => sklad.value?.useMinSizes)
const countProductsWithMinSizes = computed(
  () => productsStore.getProductsWithMinSizes?.productsWithMinSizes?.length
)

const historyLink = computed(() => `/sklad/${params?.skladId}/history`)
const costsLink = computed(() => `/sklad/${params?.skladId}/costs`)
const settingsLink = computed(() => `/sklad/${params?.skladId}/settings`)
const productsWithMinSizesLink = computed(() => `/sklad/${params?.skladId}/products-with-min-sizes`)
const categoriesLink = computed(() => `/sklad/${params?.skladId}/categories`)
const productsLink = computed(() => `/products?sklad=${params?.skladId}`)
</script>

<style lang="scss" scoped>
.home-page {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
</style>
