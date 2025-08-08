<template>
  <q-card class="full-width">
    <div class="dialog-close" id="dialog-close">
      <div class="dialog-close-line" />
    </div>
    <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
      <p class="full-width text-left text-bold q-mb-none text-subtitle1">
        {{ item ? 'Обновить' : 'Создать' }} {{ title }}
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
            v-if="item"
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
</template>

<script setup>
import {
  computed,
  reactive,
  toRefs,
  watch
} from 'vue'
import useHelpers from 'src/modules/useHelpers'
import ColorPicker from 'src/components/ColorPicker.vue'
import { useMutation } from '@vue/apollo-composable'

const props = defineProps({
  createGql: {
    type: String,
    default: null
  },
  updateGql: {
    type: String,
    default: null
  },
  item: {
    type: Object,
    defailt: () => {}
  },
  title: {
    type: String,
    default: null
  },
  extendCreateParams: {
    type: Object,
    defailt: () => {}
  }
})

const emit = defineEmits(['close', 'save', 'remove', 'on-create-new'])

const {
  item,
  createGql,
  updateGql,
  extendCreateParams
} = toRefs(props)
const formData = reactive({
  name: null,
  color: null
})

const { showSuccess, showError } = useHelpers()

const {
  mutate: create,
  error: createError,
  loading: createLoading
} = useMutation(createGql.value)
const {
  mutate: update,
  error: updateError,
  loading: updatedLoading,
} = useMutation(updateGql.value)

const isLoading = computed(() =>
  createLoading.value ||
  updatedLoading.value
)

function onColorChange(data) {
  formData.color = data.color
}

function close() {
  emit('close')
  formData.color = null
  formData.name = null  
}

async function createToDB() {
  const { data } = await create({
    data: {
      color: formData.color,
      name: formData.name,
      ...extendCreateParams.value 
    }
  })
  if (!createError.value) {
    emit('on-create-new', data)
    showSuccess('Запрос успешно выполнен!')
  } else {
    showError('Неизвестная ошибка. Проблемы на сервере.')
  }
}

async function updateFromDB() {
  await update({
    id: item.value?.id,
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
      if (item.value) {
        await updateFromDB()
      } else {
        await createToDB()
      }
    } catch (error) {
      showError('Неизвестная ошибка. Проблемы на сервере.')
    } finally {
      close()
      emit('finished')
    }
  }
}

function remove() {
  close()
  emit('remove', item.value)
}

watch(item, (newVal) => {
  formData.name = newVal?.name
  formData.color = newVal?.color
}, {
  immediate: true
})
</script>
