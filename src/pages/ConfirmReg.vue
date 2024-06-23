<template>
  <q-page
    class="flex justify-center items-center"
  >
    <div class="column q-pa-md">
      <div class="row">
        <q-card class="block-bg" style="box-shadow:var(--box-shadow);width:100%;max-width:346px;">
          <q-card-section class="flex items-center bg-green">
            <BtnBack />
            <h4 class="q-ml-md text-h6 text-white q-my-none">{{ $t('register.confirm.title') }}</h4>
          </q-card-section>
          <q-card-section>
            <p v-html="$t('register.confirm.descr', { email })" class="q-mb-none" />
          </q-card-section>
          <q-card-section
            class="text-center q-pa-sm q-pb-md"
          >
            <router-link
              to="/auth"
              class="text-grey-5"
              v-vibrate
            >
              {{ $t('register.confirm.btn') }}
            </router-link>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'

import BtnBack from 'src/components/BtnBack.vue'

export default defineComponent({
  name: 'ConfirmRegPage',
  components: {
    BtnBack,
  },
  setup() {
    const { query } = useRoute()

    const email = ref(query.email)

    return {
      email,
    }
  }
})
</script>
