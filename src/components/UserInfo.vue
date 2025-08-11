<template>
  <div class="user_info flex items-center">
    <q-avatar 
      v-if="telegramAvatar"
      size="45"
    >
      <q-img 
        :src="telegramAvatar"
        spinner-size="sm"
      />
    </q-avatar>
    <div v-else v-html="avatar" class="user_info-avatar block-bg q-pa-xs" />
    <div class="flex column q-ml-sm">
      <div class="user_info-name text-bold text-subtitle1 q-mb-xs truncate">{{ fullname || $t('mainSettings.userTab.user.noNameSpecified') }}</div>
      <div v-if="telegramId" class="user_info-telegram-id text-grey truncate">ID: {{ telegramId }}</div>
      <div v-else class="user_info-telegram-id text-grey truncate">{{ email }}</div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  toRefs
} from 'vue'
import { identicon } from 'minidenticons'

const props = defineProps({
  fullname: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  telegramId: {
    type: Number,
    default: null
  },
  telegramAvatar: {
    type: String,
    default: null
  }
})
const { telegramId, email } = toRefs(props)
const avatar = computed(() => identicon(String(telegramId.value || email.value) || ''))
</script>

<style lang="scss" scoped>
.user {
  &_info {
    &-avatar {
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 100%;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 20px;
      color: #000;
      text-transform: uppercase;
      box-shadow: var(--box-shadow);

      :deep(svg) {
        width: 100%;
        fill: $primary;
      }
    }

    &-name {
      color: var(--text-black);
    }

    &-name,
    &-telegram-id {
      line-height: normal;
    }
  }
}
</style>
