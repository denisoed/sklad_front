<template>
  <div>
    <div v-if="offline" class="offline flex justify-between items-center">
      <span>{{ $t('offline') }}</span>
      <q-icon name="mdi-wifi-off" />
    </div>
    <router-view />
    <InstallPwaDialog
      :opened="instalTgPwaDialog"
      @on-close="onCloseInstallPwaDialog"
      @on-install="onInstallPwa"
    />
    <pwa-install ref="pwaInstallerRef" />
  </div>
</template>

<script>
import { LocalStorage } from 'quasar'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { SKLAD_PWA_INSTALLED } from 'src/config'
import '@khmyznikov/pwa-install'

import InstallPwaDialog from 'src/components/Dialogs/InstallPwaDialog.vue'

export default defineComponent({
  name: 'App',
  components: {
    InstallPwaDialog,
  },
  setup() {
    const telegram = window?.Telegram?.WebApp;
    const offline = ref(false);
    const pwaInstallerRef = ref();
    const instalTgPwaDialog = ref(false);

    function openInstallPwaOnlyTelegram() {
      if (!LocalStorage.getItem(SKLAD_PWA_INSTALLED) && telegram?.initData) {
        instalTgPwaDialog.value = true;
      }
    }

    function onCloseInstallPwaDialog() {
      instalTgPwaDialog.value = false;
      LocalStorage.set(SKLAD_PWA_INSTALLED, true);
    }

    function onInstallPwa() {
      window.open('https://sklad.work/', '_blank');
      onCloseInstallPwaDialog();
    }

    function vibrate() {
      if (telegram) {
        telegram.HapticFeedback.selectionChanged();
      }
    }

    onMounted(() => {
      window.addEventListener('online', () => {
        offline.value = false;
      });
      
      window.addEventListener('offline', () => {
        offline.value = true;
      });

      document.addEventListener('click', vibrate);

      openInstallPwaOnlyTelegram();
    });

    onUnmounted(() => {
      document.removeEventListener('click', vibrate);
    });

    return {
      offline,
      instalTgPwaDialog,
      onCloseInstallPwaDialog,
      onInstallPwa,
      pwaInstallerRef,
    }
  }
})
</script>

<style lang="scss" scoped>
.offline {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  padding: 0 4px;
  text-align: left;
  font-size: 10px;
  color: #000;
  background: var(--q-negative);
}
</style>