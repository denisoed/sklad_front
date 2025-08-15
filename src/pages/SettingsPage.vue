<template>
  <q-page>
    <div class="container">
      <PageTitle :title="$t('settings.warehouseSettings')">
        <template #custom>
          <q-btn
            icon="mdi-cog-outline"
            push
            round
            text-color="primary"
            class="q-ml-auto"
          >
            <q-menu style="width: 200px;">
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  py="10px"
                >
                  <q-item-section
                    @click="onRemoveSklad"
                  >
                    <div class="flex items-center no-wrap">
                      <q-icon name="mdi-trash-can-outline" class="q-mr-sm text-deep-orange" size="xs" />
                      <span class="text-deep-orange whitespace-nowrap">{{ $t('settings.deleteWarehouse') }}</span>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </template>
      </PageTitle>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey settings_tabs"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
      >
        <q-tab name="main" :label="$t('settings.tabs.main')" />
        <q-tab name="sizes" :label="$t('settings.tabs.sizes')" />
        <q-tab name="accesses" :label="$t('settings.tabs.accesses')" />
        <q-tab name="goal" :label="$t('settings.tabs.goals')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated class="full-width">
        <q-tab-panel class="q-px-sm" name="main">
          <TheDropdown
            class="q-mt-md"
            :title="$t('settings.warehouseName')"
            opened
          >
            <template #body>
              <q-input
                v-model="formData.name"
                outlined
                dense
                :placeholder="$t('common.name')"
                class="q-mt-sm"
                enterkeyhint="done"
              />
            </template>
          </TheDropdown>
          
          <TheDropdown
            class="q-mt-md"
            :title="$t('settings.warehouseColor')"
            opened
          >
            <template #body>
              <ColorPicker
                :selected="formData.color"
                @on-change="onChangeColor"
              />
            </template>
          </TheDropdown>
        </q-tab-panel>

        <q-tab-panel name="sizes" class="q-px-sm">
          <SizesTab
            :sklad-id="skladId"
            :use-min-sizes="formData.useMinSizes"
            :min-sizes="formData.minSizes"
            @update:use-min-sizes="formData.useMinSizes = $event"
            @update:min-sizes="formData.minSizes = $event"
          />
        </q-tab-panel>
        <q-tab-panel name="accesses" class="q-px-sm">
          <EmployeesTab
            :users="users"
            class="q-mt-md full-width"
          />
        </q-tab-panel>
        <q-tab-panel name="goal" class="q-px-sm">
          <SettingsGoal
            :goal="formData.goal"
            @on-update="formData.goal = $event"
            class="q-mt-md full-width"
          />
        </q-tab-panel>
        <q-tab-panel name="print" class="q-px-sm">
          <SettingsPrint />
        </q-tab-panel>
      </q-tab-panels>
      <q-card class="q-mt-md">
      </q-card>

      <div class="col-12 flex flex-center q-mt-auto">
        <q-btn
          :label="$t('settings.saveChanges')"
          push
          color="primary"
          tabindex="8"
          :loading="isLoading"
          :disable="isLoading"
          @click="updateForm"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {
  computed,
  watch,
  reactive,
  ref,
} from 'vue'
import {
  UPDATE_SKLAD
} from 'src/graphql/sklads'
import { useMutation } from '@vue/apollo-composable'
import PageTitle from 'src/components/PageTitle.vue'
import ColorPicker from 'src/components/ColorPicker.vue'
import EmployeesTab from 'src/components/Settings/EmployeesTab.vue'
import SettingsPrint from 'src/components/Settings/Tabs/ThePrint.vue'
import SettingsGoal from 'src/components/Settings/Tabs/TheGoal.vue'
import TheDropdown from 'src/components/TheDropdown/TheDropdown.vue'
import SizesTab from 'src/components/Settings/Tabs/SizesTab.vue'
import useSklads from 'src/modules/useSklads'
import useProduct from 'src/modules/useProduct'
import useProfile from 'src/modules/useProfile'
import {
  HOME_ROUTE,
} from 'src/router/routes'
import { useI18n } from 'vue-i18n'
import useHelpers from 'src/modules/useHelpers'
import { useRoute, useRouter } from 'vue-router'

defineOptions({
  name: 'SettingsPage'
})

const { t: $t } = useI18n()
const { profile } = useProfile()
const {
  error: updateSkladError,
  loading: updateSkladLoading,
  mutate: updateSklad
} = useMutation(UPDATE_SKLAD)
const {
  sklad,
  fetchSklad,
  removeSklad,
  removeSkladLoading,
  isLoading: isLoadingSklad
} = useSklads()
const { loadProductsWithMinSizes } = useProduct()

const formData = reactive({
  name: null,
  minSizes: null,
  useMinSizes: false,
  color: null,
  goal: null,
})
const { query, params } = useRoute()
const { push, replace } = useRouter()
const { showError, showSuccess } = useHelpers()
const tab = ref(query?.tab || 'main')

const isLoading = computed(
  () => removeSkladLoading.value || isLoadingSklad.value || updateSkladLoading.value
)

const skladId = computed(() => params?.skladId)

const users = computed(() =>
  sklad.value?.users.filter(u => u?.id !== sklad.value?.owner?.id && u?.id !== profile.value?.id) || []
)

async function updateForm() {
  await updateSklad({
    id: sklad.value?.id,
    data: {
      name: formData.name,
      color: formData.color,
      goal: formData.goal,
      useMinSizes: formData.useMinSizes,
      ...(typeof +formData.minSizes === 'number' && { minSizes: +formData.minSizes }),
    }
  })
  if (!updateSkladError.value) {
    fetchSklad()
    loadProductsWithMinSizes(
      null,
      { where: { skladId: sklad.value?.id } },
      { fetchPolicy: 'network-only' }
    )
    showSuccess($t('warehouse.requestSuccess'))
  } else {
    showError($t('common.unknownError') + '. ' + $t('common.serverError'))
  }
}

function goToHomePage() {
  push(HOME_ROUTE)
}

async function onRemoveSklad() {
  removeSklad(sklad.value?.id, goToHomePage)
}

function onChangeColor(data) {
  formData.color = data.color
}

watch(sklad, (newValue) => {
  if (newValue) {
    formData.name = newValue?.name
    formData.color = newValue?.color
    formData.useMinSizes = newValue?.useMinSizes
    formData.minSizes = newValue?.minSizes
    formData.goal = newValue?.goal
  }
}, {
  immediate: true
})

watch(tab, (newTab) => {
  replace(`/sklad/${params?.skladId}/settings?tab=${newTab}`)
})
</script>

<style lang="scss" scoped>
.settings_tabs {
  :deep(.q-tabs__arrow) {
    background: var(--main-bg);
  }
}

.sizes--disabled {
  opacity: 0.4;
}
</style>
