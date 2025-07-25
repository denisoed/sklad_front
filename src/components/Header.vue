<template>
  <q-pull-to-refresh
    @refresh="refresh"
    bg-color="dark"
  >
    <q-header class="header q-gap-sm">
      <div class="flex items-center cursor-pointer">
        <q-btn icon="menu" push round @click="toggleMenu" />
        <UserInfo
          :fullname="profile?.fullname"
          :telegram-id="profile?.telegramId"
          :email="profile?.email"
          class="q-mx-auto"
          @click="goToProfile"
        />
        <NotifyList :history="histories" />
      </div>
    </q-header>
  </q-pull-to-refresh>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import Logo from 'src/assets/logo.svg'
import useSklads from 'src/modules/useSklads'
import useJwtMethods from 'src/modules/auth/useJwtMethods'
import { HOME_ROUTE } from 'src/router/routes'
import useProfile from 'src/modules/useProfile'
import { MAIN_SETTINGS_ROUTE } from 'src/router/routes'

import NotifyList from 'src/components/NotifyList.vue'
import UserInfo from 'src/components/UserInfo.vue'

export default defineComponent({
  name: 'MainLayout',
  components: {
    NotifyList,
    UserInfo
  },
  props: {
    histories: {
      type: Array,
      default: () => []
    }
  },
  emits: ['toggle-menu'],
  setup(_, { emit }) {
    const {
      sklad,
    } = useSklads()
    const { logout } = useJwtMethods()
    const { profile } = useProfile()
    const { push } = useRouter()

    function toggleMenu() {
      emit('toggle-menu');
    }

    function goToProfile() {
      push({ path: MAIN_SETTINGS_ROUTE })
    }

    function refresh() {
      window.location.reload()
    }

    return {
      Logo,
      sklad,
      logout,
      HOME_ROUTE,
      profile,
      toggleMenu,
      goToProfile,
      refresh
    }
  }
})
</script>

<style lang="scss" scoped>
.header {
  box-shadow: 0px 17px 21px -8px rgba(0,0,0,0.15);
  padding: 12px 16px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  z-index: 3;
  color: var(--text-black);
  background: var(--main-bg);

  .logo {
    span {
      font-size: 16px;
      font-weight: bold;
      margin-left: 8px;
    }
  }
}
</style>