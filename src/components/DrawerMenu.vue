<template>
  <div class="q-pa-md full-height flex column">
    <UserInfo
      :fullname="profile?.fullname"
      :telegram-id="profile?.telegramId"
      :email="profile?.email"
      class="q-mr-auto q-mb-lg q-px-xs"
      @click="copyTgId"
    />
    <q-list>
      <template v-for="(item, index) in MENU_LIST" :key="index">
        <q-item
          :to="item.to"
          :disable="item.disable"
          exact
          clickable
          v-ripple
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
        <q-separator :key="'sep' + index"  v-if="item.separator" />
      </template>
    </q-list>

    <FeedbackDialog>
      <q-item
        exact
        clickable
        v-ripple
      >
        <q-item-section avatar>
          <q-icon name="feedback" />
        </q-item-section>
        <q-item-section>
          Отзыв
        </q-item-section>
      </q-item>
    </FeedbackDialog>
    
    <q-list class="q-mt-auto">
      <q-item
        exact
        clickable
        v-ripple
        to="/post/1"
        class="hidden"
      >
        <q-item-section avatar>
          <q-img src="~assets/logo.svg" class="drawer-install-logo" />
        </q-item-section>
        <q-item-section>
          <span>Установить</span>
        </q-item-section>
      </q-item>
      <template v-for="(item, index) in MENU_LIST_BOTTOM" :key="index">
        <q-item
          v-if="item.visible"
          :to="item?.to"
          @click="item?.action"
          :disable="item.disable"
          exact
          clickable
          v-ripple
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" :color="item.color" />
          </q-item-section>
          <q-item-section>
            <span :class="`text-${item.color}`">{{ item.label }}</span>
          </q-item-section>
        </q-item>
        <q-separator :key="'sep' + index"  v-if="item.separator" />
      </template>
    </q-list>
  </div>
</template>

<script>
import {
  defineComponent,
  computed,
} from 'vue'
import { copyToClipboard } from 'quasar';
import { useI18n } from 'vue-i18n'
import UserInfo from 'src/components/UserInfo.vue'
import FeedbackDialog from 'src/components/FeedbackDialog/index.vue'
import useProfile from 'src/modules/useProfile'
import useJwtMethods from 'src/modules/auth/useJwtMethods'
import useHelpers from 'src/modules/useHelpers'

const MENU_LIST = [
  // {
  //   icon: 'mdi-account-group-outline',
  //   label: 'Контакты',
  //   separator: false,
  //   disable: true,
  //   to: '/contacts'
  // },
  // {
  //   icon: 'mdi-book-open-page-variant',
  //   iconColor: 'primary',
  //   label: 'Блог',
  //   separator: false,
  //   disable: false,
  //   to: '/posts'
  // }
]

export default defineComponent({
  name: 'DrawerMenu',
  components: {
    UserInfo,
    FeedbackDialog,
  },
  setup() {
    const { t: $t } = useI18n()
    const { profile } = useProfile()
    const { logout, revokeToken } = useJwtMethods()
    const { showSuccess } = useHelpers()

    function changeAccount() {
      revokeToken()
      logout()
    }

    const MENU_LIST_BOTTOM = computed(() => [
      {
        icon: 'settings',
        label: $t('common.settings'),
        separator: false,
        disable: false,
        to: '/main-settings',
        visible: true
      },
      {
        icon: 'mdi-logout',
        color: 'deep-orange',
        label: $t('mainSettings.userTab.logout'),
        separator: false,
        disable: false,
        visible: !window?.Telegram?.WebApp?.initData,
        action: changeAccount
      }
    ])

    function copyTgId() {
      if (!profile.value.email && !profile.value.telegramId) return
      copyToClipboard(profile.value.email || profile.value.telegramId)
      showSuccess(profile.value.email ? $t('pages.contactsCopied') : $t('pages.telegramCopied'))
    }

    return {
      profile,
      MENU_LIST,
      MENU_LIST_BOTTOM,
      copyTgId
    }
  }
})
</script>

<style lang="scss" scoped>
.q-item {
  color: var(--text-black);
}

.drawer-install-logo {
  width: 24px;
}
</style>