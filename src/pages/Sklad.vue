<template>
  <q-page class="home-page">
    <BusinessGoal />
    <div class="container q-py-md q-gap-md">
      <BlockLink
        v-if="useMinSizes && countProductsWithMinSizes"
        v-permissions="[READ_PRODUCTS_WITH_MIN_SIZES]"
        :title="$t('Sklad_8')"
        :caption="$t('Sklad_9')"
        icon="mdi-cart-arrow-up"
        :to="productsWithMinSizesLink"
        accent-color="rgb(255 0 0 / 30%)"
        v-vibrate
      >
        <q-badge
          class="absolute-top-right q-mt-sm q-mr-sm"
          color="deep-orange"
        >
          {{ countProductsWithMinSizes }}
        </q-badge>
      </BlockLink>
      <BlockLink
        v-permissions="[READ_COST]"
        :title="$t('Sklad_24')"
        :caption="$t('Sklad_25')"
        icon="mdi-cash"
        :to="costsLink"
        accent-color="rgb(255 255 0 / 20%)"
        v-vibrate
      />
      <div class="flex no-wrap full-width q-gap-md">
        <BlockLink
          v-permissions="[READ_HISTORY]"
          :title="$t('Sklad_34')"
          :caption="$t('Sklad_35')"
          icon="mdi-history"
          :to="historyLink"
          accent-color="rgb(38 236 227 / 20%)"
          v-vibrate
        />
        <BlockLink
          v-permissions="[READ_SETTINGS]"
          :title="$t('Sklad_43')"
          :caption="$t('Sklad_44')"
          icon="mdi-cog-outline"
          :to="settingsLink"
          class="q-mb-md"
          accent-color="rgb(255 95 95 / 20%)"
          v-vibrate
        />
      </div>
    </div>
    <QRModal :opened="qrModalOpened" @close="qrModalOpened = false" />
  </q-page>
</template>

<script>
import { defineComponent, computed, ref } from 'vue'
import useJwtMethods from 'src/modules/auth/useJwtMethods'
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
  READ_PRODUCTS_WITH_MIN_SIZES
} from 'src/permissions'

export default defineComponent({
  name: 'IndexPage',
  components: {
    BlockLink,
    BusinessGoal,
    QRModal
  },
  setup() {
    const { sklad } = useSklads()
    const { logout } = useJwtMethods()
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
    
    return {
      logout,
      historyLink,
      costsLink,
      productsWithMinSizesLink,
      READ_HISTORY,
      READ_SETTINGS,
      READ_STATISTIC,
      READ_COST,
      CAN_ADD_PRODUCT,
      useMinSizes,
      countProductsWithMinSizes,
      READ_PRODUCTS_WITH_MIN_SIZES,
      qrModalOpened,
      settingsLink,
    }
  }
})
</script>

<style lang="scss" scoped>
.home-page {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
</style>
