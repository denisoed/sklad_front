<template>
  <div class="sizes-presets flex column full-width">
    <div class="text-subtitle2">{{ $t('sizes.readySizes') }}</div>
    <q-checkbox
      :label="$t('sizes.childrenShoes')"
    />
    <q-checkbox
      :label="$t('sizes.womenShoes')"
    />
    <q-checkbox
      :label="$t('sizes.menShoes')"
    />
  </div>
</template>

<script>
import {
  defineComponent,
} from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'SizesPresets',
  emits: ['on-change'],
})
</script>
