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
          {{ selectedCategory ? $t('category.update') : $t('category.create') }}
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
            :hint="$t('category.selectWarehouse')"
            tabindex="1"
            clearable
            :rules="[() => !!formData.sklad || $t('common.requiredField')]"
            emit-value
            map-options
          />

          <q-input
            :label="`${$t('common.enterName')} *`"
            :hint="$t('common.requiredField')"
            :rules="[() => !!formData.name || $t('common.requiredField')]"
            v-model="formData.name"
            tabindex="2"
            outlined
            class="full-width"
            enterkeyhint="done"
          />
          <div class="flex full-width flex-start">
            <p class="full-width text-left q-mb-sm">{{ $t('category.selectColor') }}</p>
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
import { MANAGE_CATEGORY_DIALOG, MANAGE_SKLAD_DIALOG } from 'src/config/dialogs'
import useHelpers from 'src/modules/useHelpers'
import useDialog from 'src/modules/useDialog'
import useCategories from 'src/modules/useCategories'
import useSklads from 'src/modules/useSklads'
import {
  computed,
  reactive,
  ref
} from 'vue'
import ColorPicker from 'src/components/ColorPicker.vue'
import TheSelector from 'src/components/UI/TheSelector.vue'
import { useMutation } from '@vue/apollo-composable'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { fetchCategories } = useCategories()
const { closeDialog, openDialog } = useDialog()
const { showSuccess, showError } = useHelpers()
const { sklads } = useSklads()
const $q = useQuasar()
const { t: $t } = useI18n()

const route = useRoute()

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
  openDialog(MANAGE_SKLAD_DIALOG)
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
      sklad: formData.sklad
    }
  })
  if (!createError.value) {
    showSuccess($t('warehouse.requestSuccess'))
  } else {
    showError($t('common.unknownError') + '. ' + $t('common.serverError'))
  }
}

async function updateFromDB() {
  await update({
    id: selectedCategory.value?.id,
    data: {
      name: formData.name,
      color: formData.color,
      sklad: formData.sklad
    }
  })
  if (!updateError.value) {
    showSuccess($t('warehouse.requestSuccess'))
  } else {
    showError($t('common.unknownError') + '. ' + $t('common.serverError'))
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
      showError($t('common.unknownError') + '. ' + $t('common.serverError'))
    } finally {
      await fetchCategories({ sklad: formData.sklad })
      close()
    }
  }
}

function remove() {
  $q.dialog({
    title: $t('category.deleteCategory'),
    message: $t('category.confirmDeleteCategory'),
    cancel: true,
    persistent: true,
    ok: {
      color: 'deep-orange',
      label: $t('category.delete'),
      push: true
    },
    cancel: {
      color: 'grey',
      textColor: 'white',
      label: $t('common.cancel'),
      push: true
    }
  }).onOk(async () => {
    await deleteCategory({ id: selectedCategory.value.id })
    if (!deleteCategoryError.value) {
      await fetchCategories({ sklad: formData.sklad })
      showSuccess($t('category.categorySuccessfullyDeleted'))
      close()
      // NOTE: add to history
    } else {
      showError($t('common.error') + '. ' + $t('common.tryLater'))
    }
  })
}

function onBeforeShow() {
  selectedCategory.value = dialogRef.value.slotData?.category
  formData.name = selectedCategory.value?.name
  formData.color = selectedCategory.value?.color || '#000000'
  formData.sklad = selectedCategory.value?.sklad?.id || dialogRef.value.slotData?.skladId || route.params?.skladId
}
</script>