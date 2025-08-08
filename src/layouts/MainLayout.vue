<template>
  <q-layout view="lHh LpR lFf">
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
import useProfile from 'src/modules/useProfile'
import useSklads from 'src/modules/useSklads'
import TheFooter from 'src/components/TheFooter'
import useBluetooth from 'src/modules/ble/useBluetooth'

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
</script>
