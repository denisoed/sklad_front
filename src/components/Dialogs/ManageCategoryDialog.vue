<template>
  <DialogWrapper
    :id="MANAGE_CATEGORY_DIALOG"
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
          {{ selectedCategory ? 'Обновить' : 'Создать' }} категорию
        </p>
        <div class="flex justify-center q-gap-md full-width q-mt-md">
          <!-- Sklads -->
          <TheSelector
            v-model="formData.sklad"
            title-postfix="склад"
            :options="skladsOptions"
            @on-create-new="onCreateNewSklad"
            outlined
            class="full-width"
            label="Склад *"
            hint="Выберите склад для категории"
            tabindex="1"
            clearable
            :rules="[() => !!formData.sklad || 'Обязательное поле']"
            emit-value
            map-options
          />
          
          <q-input
            v-model="formData.name"
            outlined
            label="Введите название"
            class="full-width"
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
              :disabled="!formData.name || !formData.color || !formData.sklad || isLoading"
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
import useSklads from 'src/modules/useSklads'
import useProfile from 'src/modules/useProfile'
import {
  computed,
  reactive,
  ref
} from 'vue'
import ColorPicker from 'src/components/ColorPicker.vue'
import TheSelector from 'src/components/UI/TheSelector.vue'
import { useMutation } from '@vue/apollo-composable'

const { fetchCategories } = useCategories()
const { closeDialog } = useDialog()
const { showSuccess, showError } = useHelpers()
const { sklads } = useSklads()
const $q = useQuasar()

const selectedCategory = ref(null)
const dialogRef = ref()

const {
  mutate: deleteCategory,
  error: deleteCategoryError,
} = useMutation(DELETE_CATEGORY)
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

const formData = reactive({
  name: null,
  color: '#000000',
  sklad: null
})

const isLoading = computed(() =>
  createLoading.value ||
  updatedLoading.value
)

// Опции для селекта складов
const skladsOptions = computed(() => {
  return sklads.value?.map(c => ({
    label: c.name,
    value: c.id
  }))
})

function onColorChange(data) {
  formData.color = data.color
}

function onCreateNewSklad() {
  // Здесь можно добавить логику для создания нового склада
  showError('Создание складов через этот диалог не поддерживается')
}

function close() {
  formData.color = null
  formData.name = null
  formData.sklad = null
  closeDialog(MANAGE_CATEGORY_DIALOG)
}

async function createToDB() {
  await create({
    data: {
      color: formData.color,
      name: formData.name,
      sklad: formData.sklad.value
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
      sklad: formData.sklad.value
    }
  })
  if (!updateError.value) {
    showSuccess('Запрос успешно выполнен!')
  } else {
    showError('Неизвестная ошибка. Проблемы на сервере.')
  }
}

async function save() {
  if (formData.name && formData.color && formData.sklad) {
    try {
      if (selectedCategory.value) {
        await updateFromDB()
      } else {
        await createToDB()
      }
    } catch (error) {
      showError('Неизвестная ошибка. Проблемы на сервере.')
    } finally {
      await fetchCategories({ sklad: formData.sklad.value })
      close()
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
      fetchCategories({ sklad: formData.sklad.value })
      // NOTE: add to history
      showSuccess('Категория успешно удалёна!')
    } else {
      showError('Произошла ошибка. Попробуйте позже.')
    }
  })
}

function onBeforeShow() {
  selectedCategory.value = dialogRef.value.slotData?.category

  if (selectedCategory.value) {
    formData.name = selectedCategory.value?.name
    formData.color = selectedCategory.value?.color
    formData.sklad = selectedCategory.value?.sklad?.id || dialogRef.value.slotData?.skladId
  }
}
</script>