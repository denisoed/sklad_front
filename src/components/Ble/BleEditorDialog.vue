<template>
  <q-dialog
    :model-value="opened"
    position="bottom"
    @update:model-value="close"
  >
    <q-card style="width: 350px">
      <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
        <p class="full-width text-left text-bold q-mb-none text-subtitle1">
          {{ $t('printer.requiredSettingsTitle') }}
        </p>
        <div class="flex justify-center full-width q-mt-sm">
          <div class="flex column full-width q-gap-md">
            <q-input
              v-model="formData.dpi"
              outlined
              clearable
              :label="$t('printer.dpi') + ' *'"
              :hint="$t('printer.dpiHint')"
              class="full-width"
              enterkeyhint="done"
              :rules="[
                (val) => !!val || $t('common.requiredField'),
              ]"
            />
            <q-input
              v-model="formData.width"
              outlined
              clearable
              :label="$t('printer.width') + ' *'"
              :hint="$t('printer.widthHint')"
              class="full-width"
              enterkeyhint="done"
              :rules="[
                (val) => !!val || $t('common.requiredField'),
              ]"
            />
            <TheDropdown
              :title="$t('printer.additionalSettings')"
              opened
            >
              <q-input
                v-model="data.height"
                outlined
                type="number"
                :label="$t('printing.height')"
                class="q-mb-md"
              />
              <q-input
                v-model="formData.offset"
                outlined
                clearable
                :label="$t('printer.marginFromEdge')"
                :hint="$t('printer.marginHint')"
                class="full-width"
                enterkeyhint="done"
              />
            </TheDropdown>
          </div>
          <q-separator class="full-width q-my-md" />
          <div class="flex justify-between no-wrap q-gap-md full-width">
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
              icon="check"
              push
              :disabled="notValid"
              @click="save"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {
  reactive,
  watch,
  computed
} from 'vue'
import { LocalStorage } from 'quasar'
import TheDropdown from 'src/components/TheDropdown/TheDropdown.vue'

const emit = defineEmits(['on-close', 'on-save'])

const props = defineProps({
  opened: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: null
  },
})

const data = reactive({
  name: null,
  address: null,
  height: null,
  width: null,
  dpi: null,
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
</script>
