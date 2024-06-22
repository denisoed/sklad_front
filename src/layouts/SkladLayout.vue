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
      <Footer />
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, onBeforeMount, watch } from 'vue'
import useProduct from 'src/modules/useProduct'
import useSklads from 'src/modules/useSklads'
import useProfile from 'src/modules/useProfile'
import Footer from 'src/components/Footer'
import useBluetooth from 'src/modules/ble/useBluetooth'

export default defineComponent({
  name: 'SkladLayout',
  components: {
    Footer,
  },
  setup() {
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
  }
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

.q-page {
  min-height: calc(100vh - 86px) !important;
}
</style>