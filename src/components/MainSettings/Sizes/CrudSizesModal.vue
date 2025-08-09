<template>
  <q-dialog
    :model-value="opened"
    position="bottom"
    @update:model-value="close"
  >
    <SwipeToClose
      direction="down"
      @on-close="close"
    >
      <q-card class="full-width" style="width: 350px">
        <div class="dialog-close" id="dialog-close">
          <div class="dialog-close-line" />
        </div>
        <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
          <p class="full-width text-left text-bold q-mb-none text-subtitle1">
            {{ item ? $t('update') : $t('create') }} {{ title }}
          </p>
          <q-separator class="full-width q-mt-sm" />
          <div class="flex justify-center q-gap-md full-width q-mt-md">
            <q-input
              v-model="formData.name"
              outlined
              :label="$t('mainSettings.sizesTab.sizesSettings.modal.inputNameLabel')"
              :hint="$t('mainSettings.sizesTab.sizesSettings.modal.inputNameHint')"
              class="full-width"
              autofocus
              enterkeyhint="done"
            />
            
            <!-- Dynamic sizes fields -->
            <div class="full-width">
              <p class="text-subtitle2 q-mb-sm">{{ $t('mainSettings.sizesTab.sizesSettings.modal.inputSizesLabel') }}</p>
              <div 
                v-for="(size, index) in formData.sizes" 
                :key="index"
                class="flex q-gap-sm q-mb-sm items-center no-wrap full-width"
              >
                <q-input
                  v-model="formData.sizes[index]"
                  outlined
                  dense
                  class="full-width"
                  :placeholder="$t('sizes.sizeName')"
                  enterkeyhint="done"
                />
                <q-btn
                  v-if="formData.sizes.length > 1"
                  round
                  size="sm"
                  push
                  color="deep-orange"
                  icon="mdi-trash-can-outline"
                  @click="removeSize(index)"
                />
                <q-btn
                  v-if="index === formData.sizes.length - 1"
                  round
                  size="sm"
                  push
                  color="primary"
                  icon="mdi-plus"
                  @click="addSize"
                />
              </div>
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
                :disabled="!formData.name || !hasValidSizes"
                @click="save"
              />
            </div>
          </div>
        </q-card-section>
        <q-inner-loading :showing="isLoading">
          <q-spinner size="40px" color="primary" />
        </q-inner-loading>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script>
import {
  computed,
  defineComponent,
  reactive,
  toRefs,
  watch
} from 'vue'
import useHelpers from 'src/modules/useHelpers'
import { useMutation } from '@vue/apollo-composable'
import SwipeToClose from 'src/components/SwipeToClose.vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'CrubSizesModal',
  components: {
    SwipeToClose
  },
  props: {
    opened: {
      type: Boolean,
      default: false
    },
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
  },
  emits: ['close', 'save', 'remove', 'on-create-new'],
  setup(props, { emit }) {
    const {
      item,
      createGql,
      updateGql,
      extendCreateParams
    } = toRefs(props)
    const formData = reactive({
      name: null,
      sizes: ['']
    })

    const { showSuccess, showError } = useHelpers()
    const { t: $t } = useI18n()

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

    const hasValidSizes = computed(() => {
      return formData.sizes.some(size => size && size.trim() !== '')
    })

    function close() {
      emit('close')
      formData.sizes = ['']
      formData.name = null
    }

    function addSize() {
      formData.sizes.push('')
    }

    function removeSize(index) {
      if (formData.sizes.length > 1) {
        formData.sizes.splice(index, 1)
      }
    }

    async function createToDB() {
      const validSizes = formData.sizes
        .filter(size => size && size.trim() !== '')
        .map(size => ({ size: size.trim() }))

      const { data } = await create({
        data: {
          list: validSizes,
          name: formData.name,
          ...extendCreateParams.value 
        }
      })
      if (!createError.value) {
        emit('on-create-new', data)
        showSuccess('Новые размеры созданы!')
      } else {
        showError($t('common.unknownError') + '. ' + $t('common.serverError'))
      }
    }
    
    async function updateFromDB() {
      const validSizes = formData.sizes
        .filter(size => size && size.trim() !== '')
        .map(size => ({ size: size.trim() }))

      await update({
        id: item.value?.id,
        data: {
          list: validSizes,
          name: formData.name, 
        }
      })
      if (!updateError.value) {
        showSuccess('Размеры обновлены!')
      } else {
        showError($t('common.unknownError') + '. ' + $t('common.serverError'))
      }
    }

    async function save() {
      if (formData.name && hasValidSizes.value) {
        try {
          if (item.value) {
            await updateFromDB()
          } else {
            await createToDB()
          }
        } catch (error) {
          showError($t('common.unknownError') + '. ' + $t('common.serverError'))
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
      if (newVal?.list && newVal.list.length > 0) {
        formData.sizes = newVal.list.map(item => item.size)
      } else {
        formData.sizes = ['']
      }
    })

    return {
      close,
      save,
      remove,
      addSize,
      removeSize,
      formData,
      isLoading,
      hasValidSizes,
    }
  }
})
</script>
