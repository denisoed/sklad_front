<template>
  <q-layout view="lhh lpr lFf">
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
import useProfile from 'src/modules/useProfile'
import useSklads from 'src/modules/useSklads'
import Footer from 'src/components/Footer'
import useBluetooth from 'src/modules/ble/useBluetooth'

export default defineComponent({
  name: 'MainLayout',
  components: {
    Footer,
  },
  setup() {
    const {
      profile,
    } = useProfile()
    const { bluetoothAutoConnect } = useBluetooth()
    const { fetchSklads } = useSklads()

    watch(profile, (val) => {
      if (val) {
        fetchSklads(val.id)
      } 
    }, {
      immediate: true
    })

    onBeforeMount(() => {
      bluetoothAutoConnect()
    })

    return {
      profile,
    }
  }
})
</script>

<style lang="scss" scoped>
.q-page {
  min-height: calc(100vh - 70px) !important;
}
</style>
