<template>
  <DialogWrapper
    :id="MANAGE_CATEGORY_DIALOG"
    ref="dialogRef"
    position="bottom"
    @before-show="onBeforeShow"
  >
    <q-card class="full-width">
      <div class="dialog-close" id="dialog-close">
        <div class="dialog-close-line" />
      </div>
      <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
        <p class="full-width text-left text-bold q-mb-none text-subtitle1">
          {{ selectedCategory ? 'Обновить' : 'Создать' }} категорию
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
              v-if="selectedCategory"
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
import { useQuasar } from 'quasar'
import {
  DELETE_CATEGORY,
  CREATE_CATEGORY,
  UPDATE_CATEGORY
} from 'src/graphql/category'
import DialogWrapper from 'src/components/Dialogs/DialogWrapper.vue'
import { MANAGE_CATEGORY_DIALOG } from 'src/config/dialogs'
import useHelpers from 'src/modules/useHelpers'
import useDialog from 'src/modules/useDialog'
import useCategories from 'src/modules/useCategories'
import {
  computed,
  reactive,
  watch,
  ref
} from 'vue'
import ColorPicker from 'src/components/ColorPicker.vue'
import { useMutation } from '@vue/apollo-composable'

const { fetchCategories } = useCategories()
const { closeDialog } = useDialog()
const { showSuccess, showError } = useHelpers()
const $q = useQuasar()

const skladId = ref(null)
const selectedCategory = ref(null)
const dialogRef = ref()

const {
  mutate: deleteCategory,
  error: deleteCategoryError,
} = useMutation(DELETE_CATEGORY)

function onBeforeShow() {
  skladId.value = dialogRef.value.slotData?.skladId
  selectedCategory.value = dialogRef.value.slotData?.category
}

const formData = reactive({
  name: null,
  color: null
})

const {
  mutate: create,
  error: createError,
  loading: createLoading
} = useMutation(CREATE_CATEGORY)
const {
  mutate: update,
  error: updateError,
  loading: updatedLoading,
} = useMutation(UPDATE_CATEGORY)

const isLoading = computed(() =>
  createLoading.value ||
  updatedLoading.value
)

function onColorChange(data) {
  formData.color = data.color
}

function close() {
  closeDialog(MANAGE_CATEGORY_DIALOG)
  formData.color = null
  formData.name = null  
}

async function createToDB() {
  await create({
    data: {
      color: formData.color,
      name: formData.name,
      sklad: skladId.value
    }
  })
  if (!createError.value) {
    showSuccess('Запрос успешно выполнен!')
  } else {
    showError('Неизвестная ошибка. Проблемы на сервере.')
  }
}

async function updateFromDB() {
  await update({
    id: selectedCategory.value?.id,
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
      if (selectedCategory.value) {
        await updateFromDB()
      } else {
        await createToDB()
      }
    } catch (error) {
      showError('Неизвестная ошибка. Проблемы на сервере.')
    } finally {
      close()
      fetchCategories({ sklad: skladId.value })
    }
  }
}

function remove() {
  $q.dialog({
    title: 'Удалить категорию',
    message: 'Вы уверены, что хотите удалить эту категорию?',
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
    await deleteCategory({ id: selectedCategory.value.id })
    if (!deleteCategoryError.value) {
      fetchCategories({ sklad: skladId.value })
      // NOTE: add to history
      showSuccess('Категория успешно удалёна!')
    } else {
      showError('Произошла ошибка. Попробуйте позже.')
    }
  })
}

watch(selectedCategory, (newVal) => {
  formData.name = newVal?.name
  formData.color = newVal?.color
}, {
  immediate: true
})
</script>