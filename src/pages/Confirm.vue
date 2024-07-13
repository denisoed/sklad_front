<template>
  <q-page
    class="flex justify-center items-center"
  >
    <div class="column q-pa-md">
      <div class="row">
        <q-card class="block-bg" style="box-shadow:var(--box-shadow);width:100%;max-width:346px;">
          <q-card-section class="flex items-center bg-green">
            <BtnBack />
            <h4 class="q-ml-md text-h6 text-white q-my-none">{{ title }}</h4>
          </q-card-section>
          <q-card-section>
            <p class="q-mb-none">На почту <b>{{ email }}</b> отправлена ссылка, через которые вы сможете сбросить пароль. Пожалуйста, проверьте почту.</p>
          </q-card-section>
          <q-card-section
            class="text-center q-pa-sm q-pb-md"
          >
            <router-link
              to="/auth"
              class="text-grey-5"
              v-vibrate
            >
              Вернуться на стр авторизации
            </router-link>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import BtnBack from 'src/components/BtnBack.vue'

export default defineComponent({
  name: 'ConfirmPage',
  components: {
    BtnBack,
  },
  setup() {
    const { query } = useRoute()
    const { t: $t } = useI18n()

    const title = $t('Confirm_46')
    const email = ref(query.email)

    return {
      title,
      email,
    }
  }
})
</script>
