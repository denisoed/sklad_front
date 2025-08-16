<template>
  <DialogWrapper
    :id="MANAGE_SKLAD_DIALOG"
    position="bottom"
    ref="dialogRef"
    @before-show="onBeforeShow"
  >
    <q-card class="full-width">
      <div class="dialog-close" id="dialog-close">
        <div class="dialog-close-line" />
      </div>
      <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
        <p class="full-width text-left text-bold q-mb-none text-subtitle1">
          {{ selectedSklad ? $t('common.update') : $t('warehouse.create') }}
        </p>
        <q-separator class="full-width q-mb-md q-mt-sm" />
        <div class="flex justify-center q-gap-md full-width">
          <q-input
            v-model="formData.name"
            outlined
            :label="`${$t('common.enterName')} *`"
            :hint="$t('common.requiredField')"
            :rules="[() => !!formData.name || $t('common.requiredField')]"
            class="full-width"
            tabindex="1"
            enterkeyhint="done"
          />
          <div class="flex full-width flex-start">
            <p class="full-width text-left q-mb-sm">{{ $t('warehouse.selectColor') }}</p>
            <ColorPicker
              :selected="formData.color"
              @on-change="onColorChange"
            />
          </div>
          <q-separator class="full-width" />
          <div class="flex justify-between no-wrap full-width q-gap-md">
            <q-btn
              v-if="selectedSklad"
              style="height:40px;"
              color="deep-orange"
              icon="mdi-trash-can-outline"
              push
              @click="remove"
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
              :disabled="!formData.name || !formData.color || isLoading"
              @click="save"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </DialogWrapper>
</template>

<script setup>
import {
  CREATE_SKLAD,
  UPDATE_SKLAD
} from 'src/graphql/sklads'
import useProfile from 'src/modules/useProfile'
import useSklads from 'src/modules/useSklads'
import DialogWrapper from 'src/components/Dialogs/DialogWrapper.vue'
import { MANAGE_SKLAD_DIALOG } from 'src/config/dialogs'
import {
  computed,
  reactive,
  ref
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import useHelpers from 'src/modules/useHelpers'
import ColorPicker from 'src/components/ColorPicker.vue'
import { useMutation } from '@vue/apollo-composable'
import useDialog from 'src/modules/useDialog'

const { t: $t } = useI18n()
const $q = useQuasar()
const { profile } = useProfile()
const { fetchSklads, onCreateNew, removeSklad, removeSkladError } = useSklads()
const { closeDialog } = useDialog()

const selectedSklad = ref(null)
const dialogRef = ref(null)

const formData = reactive({
  name: null,
  color: null
})

const { showSuccess, showError } = useHelpers()

const {
  mutate: create,
  error: createError,
  loading: createLoading
} = useMutation(CREATE_SKLAD)
const {
  mutate: update,
  error: updateError,
  loading: updatedLoading,
} = useMutation(UPDATE_SKLAD)

const isLoading = computed(() =>
  createLoading.value ||
  updatedLoading.value
)

function onColorChange(data) {
  formData.color = data.color
}

function close() {
  closeDialog(MANAGE_SKLAD_DIALOG)
  formData.color = null
  formData.name = null  
}

async function createToDB() {
  const { data } = await create({
    data: {
      color: formData.color,
      name: formData.name,
      users: profile.value?.id,
      owner: profile.value?.id
    }
  })
  if (!createError.value) {
    onCreateNew(data)
    showSuccess($t('warehouse.requestSuccess'))
  } else {
    showError($t('common.unknownError') + '. ' + $t('common.serverError'))
  }
}

async function updateFromDB() {
  await update({
    id: selectedSklad.value?.id,
    data: {
      name: formData.name,
      color: formData.color,
    }
  })
  if (!updateError.value) {
    showSuccess($t('warehouse.requestSuccess'))
  } else {
    showError($t('common.unknownError') + '. ' + $t('common.serverError'))
  }
}

async function save() {
  if (formData.name && formData.color) {
    try {
      if (selectedSklad.value) {
        await updateFromDB()
      } else {
        await createToDB()
      }
    } catch (error) {
      showError($t('common.unknownError') + '. ' + $t('common.serverError'))
    } finally {
      await fetchSklads(profile.value.id)
      close()
    }
  }
}

function remove() {
  $q.dialog({
    title: $t('warehouse.delete'),
    message: $t('warehouse.deleteConfirm'),
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
    await removeSklad({ id: selectedSklad.value.id })
    if (!removeSkladError.value) {
      await fetchSklads(profile.value.id)
      showSuccess($t('warehouse.deletedSuccessfully'))
      close()
      // NOTE: add to history
    } else {
      showError($t('common.error') + '. ' + $t('common.tryLater'))
    }
  })
}

function onBeforeShow() {
  selectedSklad.value = dialogRef.value?.slotData?.sklad
  formData.name = selectedSklad.value?.name
  formData.color = selectedSklad.value?.color || '#000000'
}
</script>