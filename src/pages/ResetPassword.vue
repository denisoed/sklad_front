<template>
  <q-page class="window-height window-width row justify-center items-center">
    <div class="column q-pa-md">
      <div class="row">
        <q-card class="block-bg" style="box-shadow:var(--box-shadow);width:100%;max-width:346px;">
          <q-card-section class="bg-primary">
            <h4 class="text-h6 text-white q-my-none">{{ $t('reset.title') }}</h4>
          </q-card-section>
          <q-card-section class="q-pb-none">
            <q-form ref="resetForm" class="q-px-sm q-pt-md">
              <q-input v-model="password" :type="visibilityPassword ? 'text' : 'password'" :label="$t('newPassword')"
                outlined class="q-mb-md" tabindex="1">
                <template v-slot:prepend>
                  <q-icon name="lock"></q-icon>
                </template>
                <template v-slot:append>
                  <q-icon :name="visibilityPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click="visibilityPassword = !visibilityPassword" class="cursor-pointer">
                  </q-icon>
                </template>
              </q-input>
              <q-input v-model="passwordConfirm" :type="visibilityPasswordConfirm ? 'text' : 'password'"
                :label="$t('repeatPassword')" outlined lazy-rules
                :rules="[val => val == password || $t('incorrectPassword')]" tabindex="2">
                <template v-slot:prepend>
                  <q-icon name="lock"></q-icon>
                </template>
                <template v-slot:append>
                  <q-icon :name="visibilityPasswordConfirm ? 'mdi-eye-off' : 'mdi-eye'"
                    @click="visibilityPasswordConfirm = !visibilityPasswordConfirm" class="cursor-pointer">
                  </q-icon>
                </template>
              </q-input>
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-lg">
            <q-btn
              unelevated
              push
              color="primary"
              @click="submit"
              class="full-width text-white" :label="$t('reset.btn')"
              tabindex="3"
              :loading="isLoading"
              :disable="!password || !passwordConfirm"
              v-vibrate
            />
          </q-card-actions>
          <q-card-section class="text-center q-pa-sm q-pb-md">
            <router-link to="/register" class="text-grey-5">
              {{ $t('regNew') }}
            </router-link>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import useHelpers from 'src/modules/useHelpers'
import useJwtMethods from 'src/modules/auth/useJwtMethods'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'ResetPasswordPage',
  setup() {
    const { t: $t } = useI18n()
    const {
      resetPassword,
    } = useJwtMethods()
    const { push } = useRouter()
    const { showSuccess, showError } = useHelpers()
    const { query } = useRoute()

    const password = ref(null)
    const passwordConfirm = ref(null)
    const visibilityPassword = ref(false)
    const visibilityPasswordConfirm = ref(false)
    const isLoading = ref(false)
    const resetForm = ref(null)

    async function submit() {
      if (!query?.code) {
        showError($t('reset.incorrectLink'))
      } else {
        resetForm.value.validate().then(async success => {
          if (success) {
            try {
              isLoading.value = true
              await resetPassword(query?.code, password.value, passwordConfirm.value)
              showSuccess($t('reset.success'))
              push('/auth')
            } catch {
              showError($t('reset.error'))
            } finally {
              isLoading.value = false
            }
          }
        })
      }
    }

    return {
      password,
      passwordConfirm,
      visibilityPasswordConfirm,
      visibilityPassword,
      submit,
      isLoading,
      resetForm,
    }
  }
})
</script>
