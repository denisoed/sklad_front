<template>
  <q-page
    class="flex justify-center items-center"
  >
    <div class="column q-pa-md">
      <div class="row">
        <q-card class="block-bg" style="box-shadow:var(--box-shadow);width:100%;max-width:346px;">
          <q-card-section class="flex items-center bg-primary">
            <BtnBack />
            <h4 class="q-ml-md text-h6 text-white q-my-none">{{ $t('forgot.title') }}</h4>
          </q-card-section>
          <q-card-section>
            <q-form class="q-px-sm">
              <p class="text-grey">{{ $t('forgot.descr') }}</p>
              <q-input
                v-model="email"
                type="email"
                :label="$t('email')"
                outlined
                tabindex="1"
                enterkeyhint="done"
              >
                <template v-slot:prepend>
                  <q-icon name="email"></q-icon>
                </template>
              </q-input>
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-lg q-pb-lg">
            <q-btn
              unelevated
              push
              color="primary"
              @click="submit"
              class="full-width text-white"
              :label="$t('forgot.btn')"
              tabindex="2"
              :loading="isLoading"
            ></q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import BtnBack from 'src/components/BtnBack.vue'
import useHelpers from 'src/modules/useHelpers'
import useJwtMethods from 'src/modules/auth/useJwtMethods'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'ForgotPasswordPage',
  components: {
    BtnBack,
  },
  setup() {
    const { t: $t } = useI18n()
    const {
      forgotPassword,
    } = useJwtMethods()
    const { push } = useRouter()
    const { query } = useRoute()

    const email = ref(query.email)
    const isLoading = ref(false)

    const { showError } = useHelpers()

    async function submit() {
      try {
        isLoading.value = true
        await forgotPassword(email.value)
        push(email.value ? `/confirm?email=${email.value}` : '/confirm')
      } catch {
        showError($t('forgot.error'))
      } finally {
        isLoading.value = false
      }
    }

    return {
      email,
      submit,
      isLoading,
    }
  }
})
</script>
