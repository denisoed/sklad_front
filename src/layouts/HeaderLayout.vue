<template>
  <q-layout view="hHh LpR fFf">
    <q-drawer
      v-model="drawerModel"
      :width="300"
      class="text-white"
    >
      <DrawerMenu />
    </q-drawer>
    <Header
      @toggle-menu="drawerModel = !drawerModel"
      :histories="historyResult"
    />
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
import { watch, ref } from 'vue'
import useProfile from 'src/modules/useProfile'
import useSklads from 'src/modules/useSklads'
import useHistory from 'src/modules/useHistory'

import TheFooter from 'src/components/TheFooter'
import DrawerMenu from 'src/components/DrawerMenu.vue'
import Header from 'src/components/Header.vue'

const {
  profile,
} = useProfile()
const { fetchSklads, sklads } = useSklads()
const { fetchHistory, historyResult } = useHistory()

const drawerModel = ref(false)

watch(profile, (val) => {
  if (val) {
    fetchSklads(val.id)
  } 
}, {
  immediate: true
})

watch(sklads, (newValue) => {
  if (newValue) {
    const ids = newValue?.map(s => s.id)
    if (ids?.length) {
      fetchHistory()
    }
  }
}, {
  immediate: true
})
</script>
