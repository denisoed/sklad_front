<template>
  <DialogWrapper
    :id="MANAGE_CATEGORY_DIALOG"
    position="bottom"
  >
    <template v-slot="{ data }">
      <CrudModal
        :item="data?.category"
        :create-gql="CREATE_CATEGORY"
        :update-gql="UPDATE_CATEGORY"
        :extend-create-params="{ sklad: route.params?.skladId }"
        @close="onCloseModal"
        @remove="onRemove"
        @finished="onFinished"
        title="категорию"
      />
    </template>
  </DialogWrapper>
</template>

<script setup>
import { useQuasar } from 'quasar'
import {
  DELETE_CATEGORY,
  CREATE_CATEGORY,
  UPDATE_CATEGORY
} from 'src/graphql/category'
import CrudModal from 'src/components/Dialogs/CrudModal.vue'
import DialogWrapper from 'src/components/Dialogs/DialogWrapper.vue'
import { MANAGE_CATEGORY_DIALOG } from 'src/config/dialogs'
import useHelpers from 'src/modules/useHelpers'
import { useMutation } from '@vue/apollo-composable'
import useDialog from 'src/modules/useDialog'
import { useRoute } from 'vue-router'
import useCategories from 'src/modules/useCategories'

const { fetchCategories } = useCategories()
const { closeDialog } = useDialog()
const { showSuccess, showError } = useHelpers()
const route = useRoute()
const $q = useQuasar()

const {
  mutate: deleteCategory,
  error: deleteCategoryError,
} = useMutation(DELETE_CATEGORY)

function onCloseModal() {
  closeDialog(MANAGE_CATEGORY_DIALOG)
}

function onFinished() {
  fetchCategories(route.params?.skladId)
}

function onRemove(category) {
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
    await deleteCategory({ id: category.id })
    if (!deleteCategoryError.value) {
      fetchCategories(route.params?.skladId)
      // NOTE: add to history
      showSuccess('Категория успешно удалёна!')
    } else {
      showError('Произошла ошибка. Попробуйте позже.')
    }
  })
}
</script>