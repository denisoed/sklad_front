<template>
  <q-page
    class="flex justify-center items-center"
  >
    <div class="column q-pa-md">
      <div class="row">
        <q-card class="block-bg" style="box-shadow:var(--box-shadow);width:100%;max-width:346px;">
          <q-card-section class="flex items-center  bg-primary">
            <BtnBack />
            <h4 class="q-ml-md text-h6 text-white q-my-none">{{ $t('register.title') }}</h4>
          </q-card-section>
          <q-card-section class="q-pb-none">
            <q-form
              ref="regForm"
              class="q-px-sm q-pt-md"
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
                :label="$t('newPassword')"
                outlined
                lazy-rules
                :rules="[val => !!val || $t('requiredPassword')]"
                tabindex="1"
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
              <q-input
                v-model="passwordConfirm"
                :type="visibilityPasswordConfirm ? 'text' : 'password'"
                :label="$t('repeatPassword')"
                outlined
                lazy-rules
                :rules="[val => val == password || $t('incorrectPassword')]"
                tabindex="2"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-lock-plus"></q-icon>
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="visibilityPasswordConfirm ? 'mdi-eye-off' : 'mdi-eye'"
                    @click="visibilityPasswordConfirm = !visibilityPasswordConfirm"
                    class="cursor-pointer"
                  >
                  </q-icon>
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
              :label="$t('register.submit')"
              tabindex="3"
              :loading="isLoading"
              :disable="!password || !passwordConfirm"
            ></q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import useHelpers from 'src/modules/useHelpers'
import useJwtMethods from 'src/modules/auth/useJwtMethods'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import BtnBack from 'src/components/BtnBack.vue'

export default defineComponent({
  name: 'RegisterPage',
  components: {
    BtnBack,
  },
  setup() {
    const { t: $t } = useI18n()
    const {
      register,
    } = useJwtMethods()
    const { push } = useRouter()
    const {
      showSuccess,
      showError,
      isValidEmail,
    } = useHelpers()

    const email = ref(null)
    const password = ref(null)
    const passwordConfirm = ref(null)
    const visibilityPassword = ref(false)
    const visibilityPasswordConfirm = ref(false)
    const isLoading = ref(false)
    const regForm = ref(null)

    function getRandomString() {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
      const length = 8;
      let randomstring = '';
      for (var i = 0; i < length; i++) {
        const rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
      }
      return randomstring;
    }

    async function submit() {
      regForm.value.validate().then(async success => {
        if (success) {
          try {
            isLoading.value = true
            const userName = `user-${getRandomString()}`
            const data = await register(userName, email.value, password.value)
            showSuccess($t('register.success'))
            push(`/confirm-register?email=${data.user.email}`)
          } catch {
            showError($t('register.error'))
          } finally {
            isLoading.value = false
          }
        }
      })
    }

    return {
      email,
      password,
      passwordConfirm,
      visibilityPasswordConfirm,
      visibilityPassword,
      submit,
      isLoading,
      regForm,
      isValidEmail,
    }
  }
})
</script>
