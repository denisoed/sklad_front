<template>
  <q-dialog
    :model-value="opened"
    position="bottom"
    @update:model-value="close"
  >
    <q-card style="width: 350px">
      <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
        <p class="full-width text-left text-bold q-mb-none text-subtitle1">
          {{ $t('BleEditorDialog_10') }}
        </p>
        <div class="flex justify-center full-width q-mt-sm">
          <div class="flex column full-width q-gap-md">
            <q-input
              v-model="formData.dpi"
              outlined
              clearable
              :label="$t('BleEditorDialog_18')"
              class="full-width"
              :hint="$t('BleEditorDialog_20')"
              :rules="[
                (val) => !!val || $t('BleEditorDialog_22'),
              ]"
            />
            <q-input
              v-model="formData.width"
              outlined
              clearable
              :label="$t('BleEditorDialog_29')"
              :hint="$t('BleEditorDialog_30')"
              class="full-width"
              :rules="[
                (val) => !!val || $t('BleEditorDialog_33'),
              ]"
            />
            <q-expansion-item
              dense
              dense-toggle
              expand-separator
              :label="$t('BleEditorDialog_40')"
            >
              <q-input
                v-model="formData.height"
                outlined
                clearable
                :label="$t('BleEditorDialog_46')"
                :hint="$t('BleEditorDialog_47')"
                class="full-width"
              />
              <q-input
                v-model="formData.offset"
                outlined
                clearable
                :label="$t('BleEditorDialog_54')"
                class="full-width"
                :hint="$t('BleEditorDialog_56')"
              />
            </q-expansion-item>
          </div>
          <q-separator class="full-width q-my-md" />
          <div class="flex justify-between no-wrap q-gap-md full-width">
            <q-btn
              class="button-size q-mr-auto"
              color="grey"
              icon="mdi-close"
              push
              @click="close"
              v-vibrate
            />
            <q-btn
              class="button-size"
              color="primary"
              icon="check"
              push
              :disabled="notValid"
              @click="save"
              v-vibrate
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import {
  defineComponent,
  reactive,
  watch,
  toRefs,
  computed
} from 'vue'
import { LocalStorage } from 'quasar'

export default defineComponent({
  name: 'BleEditorDialog',
  props: {
    opened: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: null
    },
  },
  emits: ['on-close', 'on-save'],
  setup(props, { emit }) {
    const { opened } = toRefs(props)
    const formData = reactive({
      dpi: null,
      width: null,
      height: null,
      offset: null
    })

    const notValid = computed(() => {
      return !formData.dpi || !formData.width
    })

    function close() {
      emit('on-close')
    }
    
    function save() {
      if (!notValid.value) {
        close()
        emit('on-save', formData)
      }
    }

    watch(opened, () => {
      if (opened.value) {
        const savedDevice = LocalStorage.getItem('sklad-ble-device')
        Object.assign(formData, savedDevice)
      }
    })

    return {
      close,
      save,
      formData,
      notValid,
    }
  }
})
</script>
