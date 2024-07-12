<template>
  <div class="sizes-presets flex column full-width">
    <div class="text-subtitle2">Готовые размеры</div>
    <q-checkbox
      :label="$t('SizesPresets_5')"
    />
    <q-checkbox
      :label="$t('SizesPresets_8')"
    />
    <q-checkbox
      :label="$t('SizesPresets_11')"
    />
  </div>
</template>

<script>
import {
  defineComponent,
} from 'vue'

export default defineComponent({
  name: 'SizesPresets',
  emits: ['on-change'],
})
</script>
