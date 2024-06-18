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
      <q-tab name="user" :label="$t('mainSettings.userTab.title')" />
        <q-tab name="sizes" :label="$t('mainSettings.sizesTab.title')" />
        <q-tab name="print" :label="$t('mainSettings.printTab.title')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated class="full-width">
        <q-tab-panel name="user" class="q-px-sm flex column q-gap-md">
          <UserTab />
        </q-tab-panel>
        <q-tab-panel name="sizes" class="q-px-sm flex column q-gap-md">
          <SizesTab />
        </q-tab-panel>
        <q-tab-panel name="print" class="q-px-sm flex column q-gap-md">
          <BleIndex />
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

    const tab = ref(query?.tab || 'user')

    watch(tab, (newTab) => {
      replace(`/main-settings?tab=${newTab}`)
    })

    return {
      tab,
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
