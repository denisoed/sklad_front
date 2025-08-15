<template>
  <q-page>
    <div class="container">
      <PageTitle :title="$t('mainSettings.title')" /> 
      <q-tabs
        v-model="tab"
        dense
        class="text-grey settings_tabs"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
      >
        <q-tab
          v-for="(t, i) of TABS"
          :key="`tab_${i}`"
          :name="t.name"
          :label="$t(t.label)"
        />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated class="full-width">
        <q-tab-panel
          v-for="(t, i) of TABS"
          :key="`tab-content_${i}`"
          :name="t.name"
          class="q-px-sm flex column q-gap-md"
        >
          <component :is="t.component" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import {
  ref,
  watch
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageTitle from 'src/components/PageTitle.vue'
import UserTab from 'src/components/MainSettings/UserTab.vue'
import AppearanceTab from 'src/components/MainSettings/AppearanceTab.vue'
import ExperimentalTab from 'src/components/MainSettings/ExperimentalTab.vue'
import BleIndex from 'src/components/Ble/index.vue'

const TAB_USER = 'user'
const TAB_APPEARANCE = 'appearance'
const TAB_EXPERIMENTAL = 'experimental'
const TAB_PRINT = 'print'

const TABS = [
  {
    name: TAB_USER,
    label: 'mainSettings.userTab.title',
    component: UserTab,
    hide: false
  },
  {
    name: TAB_APPEARANCE,
    label: 'mainSettings.appearanceTab.title',
    component: AppearanceTab,
    hide: false
  },
  {
    name: TAB_EXPERIMENTAL,
    label: 'mainSettings.experimentalTab.title',
    component: ExperimentalTab,
    hide: false
  },
  {
    name: TAB_PRINT,
    label: 'mainSettings.printTab.title',
    component: BleIndex,
    hide: true
  }
].filter(t => !t.hide)

const { query } = useRoute()
const { replace } = useRouter()

const tab = ref(query?.tab || TAB_USER)

watch(tab, (newTab) => {
  replace(`/main-settings?tab=${newTab}`)
})
</script>

<style lang="scss" scoped>
.settings_tabs {
  :deep(.q-tabs__arrow) {
    background: var(--main-bg);
  }
}
</style>
