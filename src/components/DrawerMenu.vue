<template>
  <div class="q-pa-md full-height flex column">
    <UserInfo
      :fullname="profile?.fullname"
      :telegram-id="profile?.telegramId"
      :email="profile?.email"
      class="q-mr-auto q-mb-lg q-px-xs"
    />
    <q-list>
      <template v-for="(item, index) in MENU_LIST" :key="index">
        <q-item
          :to="item.to"
          :disable="item.disable"
          exact
          clickable
          v-ripple
          v-vibrate
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
      <template v-for="(item, index) in MENU_LIST_BOTTOM" :key="index">
        <q-item
          v-if="item.visible"
          :to="item?.to"
          @click="item?.action"
          :disable="item.disable"
          exact
          clickable
          v-ripple
          v-vibrate
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
} from 'vue'
import { useI18n } from 'vue-i18n'
import UserInfo from 'src/components/UserInfo.vue'
import FeedbackDialog from 'src/components/FeedbackDialog/index.vue'
import useProfile from 'src/modules/useProfile'
import useJwtMethods from 'src/modules/auth/useJwtMethods'

export default defineComponent({
  name: 'DrawerMenu',
  components: {
    UserInfo,
    FeedbackDialog,
  },
  setup() {
    const { profile } = useProfile()
    const { t: $t } = useI18n()
    const { logout, revokeToken } = useJwtMethods()

    function changeAccount() {
      revokeToken()
      logout()
    }

    const MENU_LIST = [
      // {
      //   icon: 'mdi-account-group-outline',
      //   label: $t('DrawerMenu_82'),
      //   separator: false,
      //   disable: true,
      //   to: '/contacts'
      // },
      // {
      //   icon: 'mdi-book-open-page-variant',
      //   iconColor: 'primary',
      //   label: $t('DrawerMenu_90'),
      //   separator: false,
      //   disable: false,
      //   to: '/posts'
      // }
    ]

    const MENU_LIST_BOTTOM = [
      {
        icon: 'settings',
        label: $t('DrawerMenu_115'),
        separator: false,
        disable: false,
        to: '/main-settings',
        visible: true
      },
      {
        icon: 'mdi-logout',
        color: 'deep-orange',
        label: $t('DrawerMenu_124'),
        separator: false,
        disable: false,
        visible: !window?.Telegram?.WebApp?.initData,
        action: changeAccount
      }
    ]

    return {
      profile,
      MENU_LIST,
      MENU_LIST_BOTTOM,
    }
  }
})
</script>

<style lang="scss" scoped>
.q-item {
  color: var(--text-black);
}
</style>