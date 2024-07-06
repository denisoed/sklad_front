<template>
  <q-page>
    <div class="container">
      <PageTitle title="Основные Настройки" /> 
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
          v-vibrate
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

<script>
import {
  defineComponent,
  ref,
  watch
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageTitle from 'src/components/PageTitle.vue'
import SizesTab from 'src/components/MainSettings/Sizes/SizesTab.vue'
import UserTab from 'src/components/MainSettings/UserTab.vue'
import BleIndex from 'src/components/Ble/index.vue'

const TAB_USER = 'user'
const TAB_SIZES = 'sizes'
const TAB_PRINT = 'print'

const TABS = [
  {
    name: TAB_USER,
    label: 'mainSettings.userTab.title',
    component: UserTab,
    hide: false
  },
  {
    name: TAB_SIZES,
    label: 'mainSettings.sizesTab.title',
    component: SizesTab,
    hide: false
  },
  {
    name: TAB_PRINT,
    label: 'mainSettings.printTab.title',
    component: BleIndex,
    hide: true
  }
].filter(t => !t.hide)

export default defineComponent({
  name: 'MainSettingsPage',
  components: {
    PageTitle,
    BleIndex,
    SizesTab,
    UserTab
  },
  setup() {
    const { query } = useRoute()
    const { replace } = useRouter()

    const tab = ref(query?.tab || TAB_USER)

    watch(tab, (newTab) => {
      replace(`/main-settings?tab=${newTab}`)
    })

    return {
      tab,
      TABS,
    }
  }
})
</script>

<style lang="scss" scoped>
.settings_tabs {
  :deep(.q-tabs__arrow) {
    background: var(--main-bg);
  }
}
</style>
