<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 20vh">
        404
      </div>

      <div class="text-h4" style="opacity:.4">
        Страница не найдена...
      </div>

      <q-btn
        color="primary"
        @click="onBack"
        unelevated
        to="/"
        label="Вернуться на главную"
        no-caps
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorNotFound'
})
</script>