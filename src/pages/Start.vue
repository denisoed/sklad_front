<template>
  <q-page
    class="start-page"
  >
    <div class="container container-full-height q-px-md">
      <q-img
        src="~/assets/start-banner.png"
        :alt="$t('start.bannerAlt')"
        class="start-page_banner"
        spinner-size="sm"
      />

      <div class="start-page_content flex column q-pa-lg q-gap-md q-mb-md">
        <div class="start-page_title flex column">
          {{ $t('start.welcome') }}
          <span>{{ $t('start.toSklad') }}</span>
        </div>
        <div class="start-page_descr">
          {{ $t('start.description') }}
        </div>
        <div class="start-page_buttons q-mt-md flex justify-center no-wrap q-gap-md">
          <TgAuthVue
            mode="callback"
            telegram-login="SkladManagerBot"
            request-access="write"
            @callback="onTelegramAuth"
          />
        </div>
        <q-inner-loading :showing="loading">
          <div class="flex column items-center q-gap-sm">
            <q-spinner size="md" color="primary" />
            <span>{{ $t('start.loading') }}</span>
          </div>
        </q-inner-loading>
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
import { HOME_ROUTE } from 'src/router/routes'
import TgAuthVue from 'src/components/TgAuth.vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'StartPage',
  components: {
    TgAuthVue,
  },
  setup() {
    const { t: $t } = useI18n()
    const {
      telegramAuth
    } = useJwtMethods()
    const { push } = useRouter()
    const { fetchProfile } = useProfile()

    const {
      showSuccess,
      showError,
    } = useHelpers()

    const loading = ref(false)

    async function onTelegramAuth(user) {
      try {
        loading.value = true
        await telegramAuth(JSON.stringify(user), 'web');
        fetchProfile()
        showSuccess($t('auth.success'))
        push(HOME_ROUTE)
      } catch {
        showError($t('start.error'))
      } finally {
        loading.value = false
      }
    }

    return {
      onTelegramAuth,
      loading
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
    position: relative;
    margin-top: auto;
    background: var(--main-bg);
    border-radius: var(--border-radius-sm);
    box-shadow: var(--box-shadow);
    z-index: 2;
  }
  
  &_lang {
    background: var(--main-bg);
    border-radius: var(--border-radius-sm);
    box-shadow: var(--box-shadow);
  }

  &_title {
    font-size: 32px;
    margin: 0;
    font-weight: 900;
    line-height: normal;
    text-align: center;

    span {
      color: var(--q-primary);
    }

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
    text-align: center;
    color: var(--text-description);
  }
}
</style>