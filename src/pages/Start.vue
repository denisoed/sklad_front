<template>
  <q-page
    class="start-page"
  >
    <div class="container container-full-height q-px-md">
      <q-img
        src="~/assets/start-banner.png"
        alt="Welcome to team"
        class="start-page_banner"
      />

      <div class="start-page_content flex column q-pa-lg q-gap-md q-mb-md">
        <div class="start-page_title flex column">
          Добро пожаловать
          <span class="text-primary">на Склад</span>
        </div>
        <div class="start-page_descr">
          Повышай эффективность, экономь время и деньги.
        </div>
        <div class="start-page_buttons q-mt-md flex  no-wrap q-gap-md">
          <q-btn to="/register" push v-vibrate>Создать аккаунт</q-btn>
          <q-btn to="/auth" push color="primary" v-vibrate>Войти</q-btn>
        </div>
      </div>

      <div class="start-page_lang q-pa-md">
        <q-icon name="mdi-earth" size="sm" class="q-mr-sm" />
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

<style lang="scss" scoped>
.start-page {
  padding: 0;
  background-image: linear-gradient(to bottom, #3c8aff, #458fff, #6faaff, #98c5ff, #c3deff);

  .container {
    position: relative;
  }

  &_banner {
    width: 100%;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  &_content {
    margin-top: auto;
    background: var(--main-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    z-index: 2;
  }
  
  &_lang {
    background: var(--main-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }

  &_title {
    font-size: 32px;
    margin: 0;
    font-weight: 900;
    line-height: normal;

    @media screen and (max-width: 576px) {
      font-size: 28px;
    }
  }

  &_buttons {
    .q-btn {
      flex: 1;
      white-space: nowrap;
    }
  }

  &_descr {
    max-width: 300px;
    color: var(--text-description);
  }
}
</style>