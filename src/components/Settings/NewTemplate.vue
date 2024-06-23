<template>
  <q-dialog :model-value="opened" position="bottom" @update:model-value="close">
    <q-card style="width: 350px">
      <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
        <p class="full-width text-left text-bold q-mb-none text-subtitle1">
          Создание шаблона
        </p>
        <div class="flex justify-center full-width q-mt-sm">
          <div class="flex column full-width">
            <q-select outlined v-model="formData.type" emit-value map-options clearable :options="TYPES"
              class="q-mb-md" label="Тип шаблона" behavior="menu">
              <template v-slot:prepend>
                <q-icon name="mdi-attachment" />
              </template>
              <template v-slot:option="scope">
                <q-item v-if="!scope.opt.group" v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label class="flex">
                      <div class="q-pa-sm q-mr-sm"
                        :style="`border-radius:100%;opacity:0.5;background: ${scope.opt.color};`" />
                      <span>{{ scope.opt.label }}</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-input
              v-model="formData.name"
              outlined
              clearable
              label="Название шаблона"
              class="full-width q-mb-md"
            />
            <div class="flex no-wrap">
              <q-input
                v-model="formData.width"
                outlined
                clearable
                type="number"
                label="Ширина"
                class="q-mr-md"
                min="1"
                hint="миллиметры"
                style="flex: 1;"
              />
              <q-input
                v-model="formData.height"
                outlined
                clearable
                type="number"
                label="Высота"
                hint="миллиметры"
                min="1"
                style="flex: 1;"
              />
            </div>
          </div>
          <div class="flex no-wrap q-mt-lg">
            <q-btn v-if="selected" color="deep-orange" icon="mdi-trash-can-outline" push class="q-mr-md" @click="remove" v-vibrate />
            <q-btn style="width: 100px;" color="primary" icon="check" push class="q-mr-md" @click="submit" v-vibrate />
            <q-btn color="grey" icon="mdi-close" push @click="close" v-vibrate />
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
  toRefs
} from 'vue'

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
