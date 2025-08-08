<template>
  <q-layout view="lhh lpr lFf">
    <!-- Page -->
    <q-page-container>
      <transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        appear
        :duration="300"
      >
        <router-view />
      </transition>
    </q-page-container>

    <q-footer>
      <TheFooter />
    </q-footer>
  </q-layout>
</template>

<script setup>
import { onBeforeMount, watch } from 'vue'
import useProduct from 'src/modules/useProduct'
import useSklads from 'src/modules/useSklads'
import useProfile from 'src/modules/useProfile'
import TheFooter from 'src/components/TheFooter'
import useBluetooth from 'src/modules/ble/useBluetooth'

const {
  loadProductsWithMinSizes
} = useProduct()
const {
  sklad,
  fetchSklad,
  fetchSklads
} = useSklads()
const {
  profile,
} = useProfile()
const { bluetoothAutoConnect } = useBluetooth()

watch(profile, (val) => {
  if (val) {
    fetchSklads(val.id)
  }
}, {
  immediate: true
})

watch(sklad, (s) => {
  if (s && s?.useMinSizes) {
    loadProductsWithMinSizes(
      null,
      { where: { skladId: s?.id } },
      { fetchPolicy: 'network-only' }
    )
  }
})

onBeforeMount(() => {
  fetchSklad()
  bluetoothAutoConnect()
})
</script>

<style lang="scss" scoped>
.logo {
  span {
    font-size: 16px;
    font-weight: bold;
    margin-left: 8px;
  }
}
</style>
