<template>
  <DialogWrapper
    :id="MANAGE_COST_DIALOG"
    ref="dialogRef"
    position="bottom"
    @before-show="onBeforeShow"
    @before-hide="close"
  >
    <q-card class="full-width">
      <div class="dialog-close" id="dialog-close">
        <div class="dialog-close-line" />
      </div>
      <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
        <p class="full-width text-left text-bold q-mb-none text-subtitle1">
          {{ selectedCost?.costId ? $t('costs.update') : $t('costs.create') }}
        </p>
        <q-separator class="full-width q-mb-md q-mt-sm" />
        <div class="flex justify-center q-gap-md full-width">
          <!-- Sklads -->
          <TheSelector
            v-model="formData.sklad"
            :title-postfix="$t('common.warehouse').toLowerCase()"
            :options="skladsOptions"
            @on-create-new="onCreateNewSklad"
            outlined
            class="full-width"
            :label="$t('common.warehouse') + ' *'"
            :hint="$t('warehouse.selectWarehouseHint')"
            tabindex="1"
            clearable
            :rules="[() => !!formData.sklad || $t('common.requiredField')]"
            emit-value
            map-options
          />
          <div class="flex column q-gap-sm full-width">
            <p class="full-width text-left text-bold q-mb-none text-subtitle1">{{ $t('costs.whereSpent') }}</p>
            <q-input
              v-model="formData.description"
              outlined
              :placeholder="$t('costs.exampleDescription')"
              class="full-width"
              enterkeyhint="done"
            />
          </div>
          <div class="flex column q-gap-sm full-width">
            <p class="full-width text-left text-bold q-mb-none text-subtitle1">{{ $t('costs.howMuchSpent') }}</p>
            <InputPrice
              v-model="formData.sum"
              outlined
              :placeholder="$t('costs.exampleAmount')"
              class="full-width"
            />
          </div>
          <q-separator class="full-width" />
          <div class="flex justify-between no-wrap full-width q-gap-md">
            <q-btn
              v-if="selectedCost?.costId"
              style="height:40px;"
              color="deep-orange"
              icon="mdi-trash-can-outline"
              push
              @click="remove(selectedCost.costId)"
            />
            <q-btn
              class="button-size q-mr-auto"
              color="grey"
              icon="mdi-close"
              push
              @click="close"
            />
            <q-btn
              class="button-size"
              color="primary"
              icon="mdi-check"
              push
              :loading="isLoading"
              :disabled="!formData.description || !formData.sum || !formData.sklad || isLoading"
              @click="save"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </DialogWrapper>
</template>

<script setup>
import { useQuasar } from 'quasar'
import DialogWrapper from 'src/components/Dialogs/DialogWrapper.vue'
import InputPrice from 'src/components/InputPrice.vue'
import { MANAGE_COST_DIALOG, MANAGE_SKLAD_DIALOG } from 'src/config/dialogs'
import useHelpers from 'src/modules/useHelpers'
import useDialog from 'src/modules/useDialog'
import useSklads from 'src/modules/useSklads'
import {
  computed,
  reactive,
  ref
} from 'vue'
import TheSelector from 'src/components/UI/TheSelector.vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useCosts from 'src/modules/useCosts'

const { closeDialog, openDialog } = useDialog()
const { showSuccess, showError } = useHelpers()
const { sklads } = useSklads()
const $q = useQuasar()
const { t: $t } = useI18n()

const {
  createLoading,
  fetchCosts,
  createCost,
  createError,
  costsLoading,
  deleteCost,
  deleteError,
  deleteLoading,
  updateCost,
  updateError,
  updateLoading
} = useCosts()

const route = useRoute()

const selectedCost = ref(null)
const dialogRef = ref()

const formData = reactive({
  description: null,
  sum: null,
  sklad: null
})

const isLoading = computed(() =>
  deleteLoading.value ||
  costsLoading.value ||
  createLoading.value ||
  updateLoading.value
)

const skladsOptions = computed(() => {
  return sklads.value?.map(c => ({
    label: c.name,
    value: c.id
  }))
})

function onCreateNewSklad() {
  openDialog(MANAGE_SKLAD_DIALOG)
}

function close() {
  formData.description = null
  formData.sum = null
  formData.sklad = null
  closeDialog(MANAGE_COST_DIALOG)
}

async function create() {
  await createCost({
    description: formData.description,
    sum: formData.sum,
    skladId: formData.sklad,
  })
  if (!createError.value) {
    fetchCosts()
    showSuccess($t('costs.createSuccess'))
    close()
  } else {
    showError($t('common.error') + '. ' + $t('common.tryLater'))
  }
}

async function update() {
  await updateCost({
    costId: selectedCost.value?.costId,
    description: formData.description,
    sum: formData.sum,
  })
  if (!updateError.value) {
    fetchCosts()
    showSuccess($t('costs.updateSuccess'))
    close()
  } else {
    showError($t('common.error') + '. ' + $t('common.tryLater'))
  }
}

function save() {
  if (selectedCost.value?.costId) {
    update()
  } else {
    create()
  }
}

function remove(costId) {
  $q.dialog({
    title: $t('costs.removeCost'),
    message: $t('costs.removeConfirm'),
    cancel: true,
    persistent: true,
    ok: {
      color: 'deep-orange',
      label: $t('common.delete'),
      push: true
    },
    cancel: {
      color: 'grey',
      textColor: 'white',
      label: $t('common.cancel'),
      push: true
    }
  }).onOk(async () => {
    await deleteCost(costId)
    if (!deleteError.value) {
      fetchCosts()
      close()
      // NOTE: add to history
      showSuccess($t('costs.deleteSuccess'))
    } else {
      showError($t('common.error') + '. ' + $t('common.tryLater'))
    }
  })
}

function onBeforeShow() {
  selectedCost.value = dialogRef.value.slotData
  formData.description = selectedCost.value?.description
  formData.sum = selectedCost.value?.sum
  formData.sklad = selectedCost.value?.skladId || route.params?.skladId
}
</script>