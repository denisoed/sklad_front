<template>
  <q-layout view="lHh LpR lFf">
    <!-- <q-pull-to-refresh @refresh="refresh">
    </q-pull-to-refresh> -->
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

    function refresh(done) {
      window.location.reload()
      done()
    }

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
      refresh
    }
  }
})
</script>
