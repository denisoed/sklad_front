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
          v-vibrate
        />
      </div>
      <div class="flex q-ml-auto q-mr-md q-mt-sm">
        <q-btn @click="onEdit" icon="mdi-pencil" size="sm" round push color="primary" v-vibrate />
      </div>
    </div>
  </q-expansion-item>
</template>


<script>
import {
  defineComponent,
} from 'vue'
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
      default: 'Название размеров' 
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
        title: `Удалить размер "${sizeToRemove.size}"?`,
        message: 'Вы уверены, что хотите удалить этот размер?',
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
        try {
          // Создаем новый список без удаляемого размера
          const newList = props.list.filter(item => item.size !== sizeToRemove.size)
          
          // Если список станет пустым, показываем предупреждение
          if (newList.length === 0) {
            showError('Нельзя удалить все размеры. Используйте кнопку редактирования для удаления всего набора размеров.')
            return
          }

          // Формируем данные точно так же, как в CrudSizesModal
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
            showSuccess('Размер успешно удален!')
            emit('on-update')
          } else {
            showError('Произошла ошибка при удалении размера.')
          }
        } catch (error) {
          showError('Произошла ошибка при удалении размера.')
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
