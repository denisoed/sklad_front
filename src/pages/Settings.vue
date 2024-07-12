<template>
  <q-page>
    <div class="container">
      <PageTitle :title="$t('Settings_4')" /> 
      <q-tabs
        v-model="tab"
        dense
        class="text-grey settings_tabs"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
      >
        <q-tab name="main" :label="$t('Settings_13')" v-vibrate />
        <q-tab name="sizes" :label="$t('Settings_14')" v-vibrate />
        <q-tab name="accesses" :label="$t('Settings_15')" v-vibrate />
        <q-tab name="goal" :label="$t('Settings_16')" v-vibrate />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated class="full-width">
        <q-tab-panel class="q-px-sm" name="main">
          <div class="q-mt-md">
            <h6 class="q-ma-none  text-subtitle1">Название склада</h6>
            <q-input
              v-model="formData.name"
              outlined
              dense
              :placeholder="$t('Settings_29')"
              class="q-mt-sm"
            />
          </div>
          <div class="q-mt-md">
            <h6 class="q-ma-none  text-subtitle1">Цвет склада</h6>
            <div class="col-12 q-mt-md flex flex-center">
              <ColorPicker
                :selected="formData.color"
                @on-change="formData.color = $event"
              />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="sizes" class="q-px-sm">
          <div
            class="full-width q-pa-xs q-mt-md"
            style="border: 1px solid var(--border-color);border-radius: var(--border-radius)"
          >
            <q-checkbox
              v-model="formData.useMinSizes"
              :label="$t('Settings_51')"
            />
            <div v-if="formData.useMinSizes" class="q-pa-sm">
              <h6
                class="q-ma-none q-mb-sm text-subtitle2"
              >
                Если размеров в товаре окажется меньше или равно указанному значению, он попадёт в раздел $t('Settings_57')" на главной странице склада
              </h6>
              <q-input
                v-model="formData.minSizes"
                type="number"
                outlined
                min="0"
                :label="$t('Settings_64')"
                :hint="$t('Settings_65')"
                :rules="[val => val >= 0 || 'Значение должно быть больше или равно нулю']"
              />
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="accesses" class="q-px-sm">
          <Employee
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

      <div class="col-12 flex q-pt-lg q-mt-auto">
        <q-btn
          icon="mdi-cog-outline"
          push
          color="secondary"
          class="q-mr-auto"
          v-vibrate
        >
          <q-menu>
            <q-list>
              <q-item
                clickable
                v-close-popup
                py="10px"
                v-vibrate
              >
                <q-item-section
                  @click="onRemoveSklad"
                  v-vibrate
                >
                  <div class="flex items-center">
                    <q-icon name="mdi-trash-can-outline" class="q-mr-sm text-deep-orange" size="xs" />
                    <span class="text-deep-orange">Удалить склад</span>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn
          :label="$t('Settings_121')"
          push
          color="primary"
          class="q-ml-auto"
          tabindex="8"
          :loading="isLoading"
          :disable="isLoading"
          @click="updateForm"
          v-vibrate
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import {
  defineComponent,
  computed,
  watch,
  reactive,
  ref
} from 'vue'
import {
  UPDATE_SKLAD
} from 'src/graphql/sklads'
import { useMutation } from '@vue/apollo-composable'
import PageTitle from 'src/components/PageTitle.vue'
import ColorPicker from 'src/components/ColorPicker.vue'
import Employee from 'src/components/Settings/Employee'
import SettingsPrint from 'src/components/Settings/Tabs/Print.vue'
import SettingsGoal from 'src/components/Settings/Tabs/Goal.vue'
import useSklads from 'src/modules/useSklads'
import useProduct from 'src/modules/useProduct'
import useProfile from 'src/modules/useProfile'
import useHelpers from 'src/modules/useHelpers'
import { useRoute, useRouter } from 'vue-router'
import {
  HOME_ROUTE
} from 'src/router/routes'

export default defineComponent({
  name: 'SettingsPage',
  components: {
    PageTitle,
    Employee,
    ColorPicker,
    SettingsPrint,
    SettingsGoal
  },
  setup() {
    const { query, params } = useRoute()
    const { push, replace } = useRouter()
    const tab = ref(query?.tab || 'main')
    const { showError, showSuccess } = useHelpers()
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

    const isLoading = computed(
      () => removeSkladLoading.value || isLoadingSklad.value || updateSkladLoading.value
    )

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
        showSuccess($t('Settings_225'))
      } else {
        showError($t('Settings_227'))
      }
    }

    function goToHomePage() {
      push(HOME_ROUTE)
    }

    async function onRemoveSklad() {
      removeSklad(sklad.value?.id, goToHomePage)
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

    return {
      users,
      updateSkladLoading,
      formData,
      updateForm,
      isLoading,
      tab,
      onRemoveSklad
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

.sizes--disabled {
  opacity: 0.4;
}
</style>
