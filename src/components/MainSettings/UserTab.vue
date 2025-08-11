<template>
  <div class="user-tab flex column q-gap-md">
    <!-- <div class="user-tab_subscr flex items-center justify-between q-pa-md">
      <span class="text-bold text-white">{{ $t('mainSettings.userTab.subscription.title') }}</span>
      <span class="text-white">{{ $t('mainSettings.userTab.subscription.activeUntil') }} <span class="text-bold">{{ subscrExpiredAt }}</span></span>
    </div> -->
    <!-- Info -->
    <div class="user-tab_info block-bg flex column q-pa-md">
      <div class="flex items-center">
        <UserInfo
          :fullname="profile?.fullname"
          :telegram-id="profile?.telegramId"
          :telegram-avatar="profile?.telegramAvatar"
          :email="profile?.email"
          @click="copyTgId"
        />
        <q-btn @click="switchEdit" round push class="q-ml-auto bg-white" size="sm">
          <q-icon name="mdi-pencil" color="primary" />
        </q-btn>
      </div>
      <div v-if="editable" class="flex q-mt-md">
        <div class="full-width flex items-end no-wrap">
          <div class="flex column full-width">
            <span class="input-title q-mb-xs">{{ $t('mainSettings.userTab.user.fullnameTitle') }}</span>
            <q-input
              v-model="userInfo.fullname"
              outlined
              dense
              class="q-pr-sm full-width"
              :placeholder="$t('mainSettings.userTab.user.fullnamePlaceholder')"
              enterkeyhint="done"
            />
          </div>
          <q-btn
            push
            color="primary"
            style="height: 40px"
            class="border-radius-sm"
            @click="saveUserInfo"
            :disable="userInfo.fullname === profile?.fullname"
          >
            <q-icon name="mdi-check" />
          </q-btn>
        </div>
      </div>
    </div>

    <!-- <TheDropdown :title="`${$t('mainSettings.userTab.wallet.title')}: <span class='text-green'>0 KGS</span>`">
      <template #icon>
        <q-icon name="mdi-wallet-outline" size="sm" class="q-mr-sm" />
      </template>
      <template #body>
        <div class="flex column">
          <div class="flex column q-mb-md">
            <label v-for="(l, i) of PRICES" :key="i" style="height: 50px;" class="flex items-center cursor-pointer q-pr-xs">
              <span class="text-green text-bold">{{ l.label }} KGS</span>
              <q-radio v-model="price" dense :val="l.value" class="q-ml-auto" />
            </label>
          </div>
          <div class="flex items-center justify-between q-gap-md">
            <q-toggle v-model="refillWallet" :label="$t('mainSettings.userTab.autoRefill')" dense />
            <q-btn color="primary" push>{{ $t('mainSettings.userTab.wallet.topUp') }}</q-btn>
          </div>
        </div>
      </template>
    </TheDropdown> -->

    <TheDropdown :title="$t('mainSettings.userTab.lang')" opened>
      <template #icon>
        <q-icon name="mdi-earth" size="sm" class="q-mr-sm" />
      </template>
      <template #body>
        <div class="flex column">
          <label v-for="(l, i) of LANGS" :key="i" style="height: 50px;" class="flex items-center cursor-pointer q-pr-xs">
            <q-img :src="l.flag" alt="logo" style="height: 20px; max-width: 20px" class="q-mr-md" />
            <span>{{ l.label }}</span>
            <q-radio v-model="locale" dense :val="l.value" class="q-ml-auto" />
          </label>
        </div>
      </template>
    </TheDropdown>

    <!-- <TheDropdown :title="$t('mainSettings.userTab.theme.title')">
      <template #icon>
        <q-icon name="mdi-theme-light-dark" size="sm" class="q-mr-sm" />
      </template>
      <template #body>
        <label class="flex items-center cursor-pointer">
          <q-icon name="mdi-moon-waxing-crescent mdi-rotate-45" class="q-mr-md" />
          <span>{{ $t('mainSettings.userTab.theme.dark')}}</span>
          <q-toggle v-model="isDark" class="q-ml-auto" />
        </label>
      </template>
    </TheDropdown> -->

    <!-- <TheDropdown :title="$t('mainSettings.userTab.info')">
      <template #icon>
        <q-icon name="mdi-account-question-outline" size="sm" class="q-mr-sm" />
      </template>
    </TheDropdown> -->
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  watch,
  computed
} from 'vue'
import { LocalStorage, copyToClipboard } from 'quasar';
import TheDropdown from 'src/components/TheDropdown/TheDropdown.vue'
import UserInfo from 'src/components/UserInfo.vue'
import useProfile from 'src/modules/useProfile'
import useHelpers from 'src/modules/useHelpers'
import useTheme from 'src/modules/useTheme'
import RU from 'src/assets/russia.png'
import KG from 'src/assets/kyrgyzstan.png'
import EN from 'src/assets/united-states.png'
import { I18N_LOCALE } from 'src/config'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'UserTab'
})

const { toggleTheme, isDark } = useTheme();
const { locale, t: $t } = useI18n({ useScope: 'global' })
const { showSuccess, showError } = useHelpers()
const { profile, updateUser, fetchProfile, subscrHasExpired, subscrExpiredAt } = useProfile()

const PRICES = [
  {
    label: '2,000',
    value: 2000
  },
  {
    label: '1,000',
    value: 1000
  },
  {
    label: '500',
    value: 500
  },
  {
    label: '200',
    value: 200
  },
]

const LANGS = computed(() => [
  {
    label: $t('mainSettings.userTab.languages.russian'),
    value: 'ru-RU',
    flag: RU
  },
  {
    label: $t('mainSettings.userTab.languages.kyrgyz'),
    value: 'kg-KG',
    flag: KG
  },
  {
    label: $t('mainSettings.userTab.languages.english'),
    value: 'en-US',
    flag: EN
  },
])

const selected = ref([])
const price = ref(1000)
const refillWallet = ref(true)

const editable = ref(false)
const userInfo = reactive({
  fullname: null
})

function switchEdit() {
  editable.value = !editable.value
}

async function saveUserInfo() {
  // NOTE: add loader to btn 
  try {
    await updateUser(profile.value?.id, {
      ...userInfo,
    })
    await fetchProfile()
    showSuccess($t('mainSettings.userTab.user.success'))
  } catch (error) {
    showError($t('mainSettings.userTab.user.error'))
  }
}

function copyTgId() {
  if (!profile.value.email && !profile.value.telegramId) return
  copyToClipboard(profile.value.email || profile.value.telegramId)
  showSuccess(profile.value.email ? $t('pages.contactsCopied') : $t('pages.telegramCopied'))
}

watch(locale, (lang) => {
  LocalStorage.set(I18N_LOCALE, lang)
})

watch(profile, (val) => {
  userInfo.fullname = val?.fullname
}, { immediate: true })

watch(isDark, () => {
  toggleTheme()
})
</script>

<style lang="scss" scoped>
.user-tab {
  &_subscr {
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
    background-color: #4158D0;
    background-image: linear-gradient(43deg, var(--q-primary) 0%, #C850C0 46%, #FFCC70 100%);
  }

  &_info {
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
  }
  
  &_logout {
    position: relative;
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
  }

  .input-title {
    font-size: 12px;
    color: var(--text-description);
  }
}
</style>
