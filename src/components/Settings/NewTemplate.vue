<template>
  <q-dialog :model-value="opened" position="bottom" @update:model-value="close">
    <q-card style="width: 350px">
      <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
        <p class="full-width text-left text-bold q-mb-none text-subtitle1">
          Создание шаблона
        </p>
        <div class="flex justify-center full-width q-mt-sm">
          <div class="flex column full-width">
            <q-select
              v-model="data.type"
              :options="templateTypes"
              outlined
              class="q-mb-md"
              :label="$t('printing.templateType')"
              behavior="menu"
            />
            
            <q-input
              ref="nameRef"
              v-model="data.name"
              outlined
              class="q-mb-md"
              :label="$t('printing.templateName')"
              :rules="[val => val?.length || $t('common.requiredField')]"
            />
            
            <div class="flex full-width q-gap-md q-mb-md">
              <q-input
                v-model="data.width"
                outlined
                type="number"
                class="col"
                :label="$t('printing.width')"
                :hint="$t('printing.millimeters')"
                :rules="[val => val?.length || $t('common.requiredField')]"
              />
              <q-input
                v-model="data.height"
                outlined
                type="number"
                class="col"
                :label="$t('printing.height')"
                :hint="$t('printing.millimeters')"
                :rules="[val => val?.length || $t('common.requiredField')]"
              />
            </div>
          </div>
          <div class="flex no-wrap q-mt-lg">
            <q-btn v-if="selected" color="deep-orange" icon="mdi-trash-can-outline" push class="q-mr-md" @click="remove" />
            <q-btn style="width: 100px;" color="primary" icon="check" push class="q-mr-md" @click="submit" />
            <q-btn color="grey" icon="mdi-close" push @click="close" />
          </div>
        </div>
      </q-card-section>
      <q-inner-loading :showing="isLoading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script>
import {
  defineComponent,
  reactive,
  watch,
  toRefs,
  ref,
  computed
} from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'NewTemplate',
  props: {
    selected: {
      type: Object,
      default: null,
    },
    opened: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
  },
  emits: ['close', 'on-create', 'on-delete'],
  setup(props, { emit }) {
    const { selected } = toRefs(props)
    const formData = reactive({
      id: null,
      type: null,
      name: null,
      width: null,
      height: null,
    })

    const TYPES = [
      {
        label: 'Ценник',
        value: 'price-label',
        color: 'rgb(0 0 255 / 50%)',
      },
    ]

    const { t: $t } = useI18n()

    const templateTypes = computed(() => [
      { label: $t('printing.priceLabel'), value: 'price-label' }
    ])

    function close() {
      emit('close')
    }

    function submit() {
      emit('on-create', {
        type: formData.type,
        name: formData.name,
        width: formData.width,
        height: formData.height,
      })
    }

    function remove() {
      emit('on-delete', formData.id)
    }

    function clear() {
      formData.id = null
      formData.type = null
      formData.name = null
      formData.width = null
      formData.height = null
    }

    watch(selected, (newVal) => {
      formData.id = newVal?.id
      formData.type = newVal?.type
      formData.name = newVal?.name
      formData.width = newVal?.width
      formData.height = newVal?.height
    })

    return {
      close,
      submit,
      TYPES,
      formData,
      clear,
      remove,
    }
  }
})
</script>
