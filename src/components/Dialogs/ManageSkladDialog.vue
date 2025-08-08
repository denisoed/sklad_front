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
          {{ selectedSklad ? 'Обновить' : 'Создать' }} склад
        </p>
        <div class="flex justify-center q-gap-md full-width q-mt-md">
          <q-input
            v-model="formData.name"
            outlined
            label="Введите название"
            class="full-width"
            autofocus
            enterkeyhint="done"
          />
          <div class="flex full-width flex-start">
            <p class="full-width text-left q-mb-sm">Выберите цвет для визуального отличия</p>
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
import useHelpers from 'src/modules/useHelpers'
import ColorPicker from 'src/components/ColorPicker.vue'
import { useMutation } from '@vue/apollo-composable'
import useDialog from 'src/modules/useDialog'

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
    showSuccess('Запрос успешно выполнен!')
  } else {
    showError('Неизвестная ошибка. Проблемы на сервере.')
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
    showSuccess('Запрос успешно выполнен!')
  } else {
    showError('Неизвестная ошибка. Проблемы на сервере.')
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
      showError('Неизвестная ошибка. Проблемы на сервере.')
    } finally {
      await fetchSklads(profile.value.id)
      close()
    }
  }
}

function remove() {
  $q.dialog({
    title: 'Удалить склад',
    message: 'Вы уверены, что хотите удалить этот склад?',
    cancel: true,
    persistent: true,
    ok: {
      color: 'deep-orange',
      label: 'Удалить',
      push: true
    },
    cancel: {
      color: 'white',
      textColor: 'black',
      label: 'Отмена',
      push: true
    }
  }).onOk(async () => {
    await removeSklad({ id: selectedSklad.value.id })
    if (!removeSkladError.value) {
      await fetchSklads(profile.value.id)
      showSuccess('Склад успешно удалён!')
      close()
      // NOTE: add to history
    } else {
      showError('Произошла ошибка. Попробуйте позже.')
    }
  })
}

function onBeforeShow() {
  selectedSklad.value = dialogRef.value?.slotData?.sklad
  formData.name = selectedSklad.value?.name
  formData.color = selectedSklad.value?.color || '#000000'
}
</script>