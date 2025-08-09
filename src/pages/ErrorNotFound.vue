<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 20vh">
        404
      </div>

      <div class="text-h4" style="opacity:.4">
        {{ $t('error.pageNotFound') }}
      </div>

      <q-btn
        color="primary"
        @click="onBack"
        unelevated
        to="/"
        :label="$t('common.backToHome')"
        no-caps
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'ErrorNotFound',
  setup() {
    const { t: $t } = useI18n()

    return { $t }
  }
})
</script>