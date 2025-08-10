<template>
  <q-expansion-item
    v-model="expanded"
    :label="name"
  >
    <div class="flex no-wrap q-gap-sm items-start">
      <div class="flex flex-start items-center q-gap-xs q-my-sm q-px-md">
        <q-chip
          v-for="(s, i) of list"
          :key="i"
          color="primary"
          text-color="white"
          :label="s.size"
          :disable="disable"
          removable
          @remove="onRemoveSize(s)"
        />
      </div>
      <div class="flex q-ml-auto q-mr-md q-mt-sm">
        <q-btn @click="onEdit" icon="mdi-pencil" size="sm" round push color="primary" />
      </div>
    </div>
  </q-expansion-item>
</template>


<script>
import {
  defineComponent,
  ref
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useMutation } from '@vue/apollo-composable'
import { UPDATE_SIZES } from 'src/graphql/sizes'
import useHelpers from 'src/modules/useHelpers'

export default defineComponent({
  name: 'SizeItem',
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'Size names'
    },
    list: {
      type: Array,
      default: () => []
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['on-edit', 'on-update'],
  setup(props, { emit }) {
    const { t: $t } = useI18n()
    const $q = useQuasar()
    const { showSuccess, showError } = useHelpers()
    
    const {
      mutate: updateSizes,
      loading: updateLoading,
      error: updateError,
    } = useMutation(UPDATE_SIZES)

    function onEdit() {
      emit('on-edit')
    }

    function onRemoveSize(sizeToRemove) {
      if (props.disable) return

      $q.dialog({
        title: $t('mainSettings.sizesTab.deleteSize'),
        message: $t('mainSettings.sizesTab.deleteConfirm'),
        cancel: true,
        persistent: true,
        ok: {
          color: 'deep-orange',
          label: $t('common.delete'),
          push: true
        },
        cancel: {
          color: 'white',
          textColor: 'black',
          label: $t('common.cancel'),
          push: true
        }
      }).onOk(async () => {
        try {
          // Create a new list without the removed size
          const newList = props.list.filter(item => item.size !== sizeToRemove.size)
          
          // If the list becomes empty, show warning
          if (newList.length === 0) {
            showError($t('sizes.cannotDeleteAllSizes'))
            return
          }

          // Form data exactly as in CrudSizesModal
          const sizesString = newList.map(item => item.size).join(', ')
          const formattedList = sizesString.split(',').map(s => ({ size: s?.trim() }))

          await updateSizes({
            id: props.id,
            data: {
              list: formattedList,
              name: props.name,
            }
          })
          
          if (!updateError.value) {
            showSuccess($t('sizes.sizeDeleted'))
            emit('on-update')
          } else {
            showError($t('sizes.errorDeletingSize'))
          }
        } catch (error) {
          showError($t('sizes.errorDeletingSize'))
        }
      })
    }

    return {
      onEdit,
      onRemoveSize,
      updateLoading
    }
  }
})
</script>
