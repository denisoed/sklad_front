<template>
  <div class="q-pa-md full-height flex column">
    <UserInfo
      :fullname="profile?.fullname"
      :telegram-id="profile?.telegramId"
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
import UserInfo from 'src/components/UserInfo.vue'
import FeedbackDialog from 'src/components/FeedbackDialog/index.vue'
import useProfile from 'src/modules/useProfile'

const MENU_LIST = [
  {
    icon: 'mdi-account-group-outline',
    label: 'Контакты',
    separator: false,
    disable: true,
    to: '/contacts'
  },
  {
    icon: 'help',
    iconColor: 'primary',
    label: 'Помошь',
    separator: false,
    disable: true,
    to: '/help-center'
  }
]

export default defineComponent({
  name: 'DrawerMenu',
  components: {
    UserInfo,
    FeedbackDialog,
  },
  setup() {
    const { profile } = useProfile()

    const MENU_LIST_BOTTOM = [
      {
        icon: 'settings',
        label: 'Настройки',
        separator: false,
        disable: false,
        to: '/main-settings'
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