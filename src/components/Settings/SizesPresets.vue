<template>
  <div class="sizes-presets flex column full-width">
    <div class="text-subtitle2">Готовые размеры</div>
    <q-checkbox
      label="Размеры детской обуви"
    />
    <q-checkbox
      label="Размеры женской обуви"
    />
    <q-checkbox
      label="Размеры мужской обуви"
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
