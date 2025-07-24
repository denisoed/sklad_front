<template>
  <q-page
    class="flex justify-center items-center"
  >
    <div class="column q-pa-md">
      <div class="row">
        <q-card class="block-bg" style="box-shadow:var(--box-shadow);width:100%;max-width:346px;">
          <q-card-section class="bg-primary">
            <h4 class="text-h6 text-white q-my-none">{{ $t('auth.title') }}</h4>
          </q-card-section>
          <q-card-section class="text-center q-pt-md q-px-lg q-pb-sm">
            <!-- Login Providers -->
            <div class="flex column">
              <div class="page-login_providers-list d-flex justify-content-center mt-3">
                <q-btn push :href="CONNECT_GOOGLE" class="full-width">
                  <div class="flex items-center justify-center q-gap-sm">
                    <q-icon name="mdi-google" class="text-primary" size="xs" />
                    <p class="text-grey-5 q-ma-none">{{ $t('auth.google') }}</p>
                  </div>
                </q-btn>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="relative q-px-lg">
            <q-separator />
            <span
              class="block-bg absolute text-center q-px-sm"
              style="top:6px;left:50%;transform:translateX(-50%);"
            >
              {{ $t('or') }}
            </span>
          </q-card-section>
          <q-card-section class="q-py-sm">
            <q-form
              ref="authForm"
              class="q-px-sm"
            >
              <q-input
                v-model="email"
                type="email"
                :label="$t('email')"
                outlined
                lazy-rules
                :rules="[val => !!val || $t('requiredEmail'), isValidEmail]"
                tabindex="1"
              >
                <template v-slot:prepend>
                  <q-icon name="email"></q-icon>
                </template>
              </q-input>
              <q-input
                v-model="password"
                :type="visibilityPassword ? 'text' : 'password'"
                :label="$t('password')"
                outlined
                lazy-rules
                :rules="[val => !!val || $t('requiredPassword')]"
                tabindex="2"
                class="q-pb-none"
              >
                <template v-slot:prepend>
                  <q-icon name="lock"></q-icon>
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="visibilityPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click="visibilityPassword = !visibilityPassword"
                    class="cursor-pointer"
                  >
                  </q-icon>
                </template>
              </q-input>
            </q-form>
          </q-card-section>
          <q-card-section class="q-px-lg q-pa-sm">
            <router-link
              :to="email ? `/forgot-password?email=${email}` : '/forgot-password'"
              class="text-grey-5 flex items-center"
            >
              <q-icon
                name="mdi-lock-reset"
                class="q-mr-sm"
              />
              {{ $t('auth.forgot') }}
            </router-link>
          </q-card-section>
          <q-card-actions class="q-px-lg">
            <q-btn
              unelevated
              push
              color="primary"
              @click="submit"
              class="full-width text-white"
              :label="$t('auth.btn')"
              tabindex="3"
              :loading="isLoading"
            ></q-btn>
          </q-card-actions>
          <q-card-section
            class="text-center q-pa-sm q-pb-md"
          >
            <router-link
              to="/register"
              class="text-grey-5 flex flex-center q-gap-sm"
            >
              {{ $t('regNew') }}
              <q-icon name="mdi-account-plus" size="sm" />
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
import useProfile from 'src/modules/useProfile'
import useJwtMethods from 'src/modules/auth/useJwtMethods'
import { useRouter } from 'vue-router'
import { CONNECT_GOOGLE } from 'src/config'
import { HOME_ROUTE } from 'src/router/routes'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'AuthPage',
  setup() {
    const { t: $t } = useI18n()
    const authForm = ref(null)
    const email = ref(null)
    const password = ref(null)
    const visibilityPassword = ref(false)
    const isLoading = ref(false)

    const {
      login,
    } = useJwtMethods()
    const { push } = useRouter()
    const { fetchProfile } = useProfile()

    const {
      showSuccess,
      showError,
      isValidEmail
    } = useHelpers()

    async function submit() {
      authForm.value.validate().then(async success => {
        if (success) {
          try {
            isLoading.value = true
            await login(email.value, password.value)
            fetchProfile()
            showSuccess($t('auth.success'))
            push(HOME_ROUTE)
          } catch {
            showError($t('auth.error'))
          } finally {
            isLoading.value = false
          }
        }
      })
    }

    return {
      email,
      password,
      visibilityPassword,
      submit,
      isLoading,
      isValidEmail,
      authForm,
      CONNECT_GOOGLE,
    }
  }
})
</script>
