<template>
  <div>
    <div v-if="offline" class="offline flex justify-between items-center">
      <span>{{ $t('offline') }}</span>
      <q-icon name="mdi-wifi-off" />
    </div>
    <router-view />
    <InstallPwaDialog
      :opened="instalPwaDialog"
      @on-close="onCloseInstallPwaDialog"
      @on-install="onInstallPwa"
    />
  </div>
</template>

<script>
import { LocalStorage } from 'quasar'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { SKLAD_PWA_INSTALLED } from 'src/config'

import InstallPwaDialog from 'src/components/Dialogs/InstallPwaDialog.vue'

export default defineComponent({
  name: 'App',
  components: {
    InstallPwaDialog,
  },
  setup() {
    const telegram = window?.Telegram?.WebApp;
    const offline = ref(false);
    const instalPwaDialog = ref(false);
    const deferredPrompt = ref();

    function openInstallPwaOnlyTelegram() {
      if (!LocalStorage.getItem(SKLAD_PWA_INSTALLED)) {
        instalPwaDialog.value = true;
      }
    }

    function onCloseInstallPwaDialog() {
      instalPwaDialog.value = false;
      LocalStorage.set(SKLAD_PWA_INSTALLED, true);
    }

    function onInstallPwa() {
      if (!telegram?.initData) {
        deferredPrompt.value.prompt();
        deferredPrompt.value.userChoice
          .then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              LocalStorage.set(SKLAD_PWA_INSTALLED, true);
              instalPwaDialog.value = false;
            }
          });
      } else {
        window.open('https://sklad.work/', '_blank');
      }
    }

    function beforeinstallprompt(e) {
      deferredPrompt.value = e;
    }

    onMounted(() => {
      window.addEventListener('online', () => {
        offline.value = false;
      });
      
      window.addEventListener('offline', () => {
        offline.value = true;
      });

      openInstallPwaOnlyTelegram();

      window.addEventListener('beforeinstallprompt', beforeinstallprompt);
    });

    onUnmounted(() => {
      window.removeEventListener('beforeinstallprompt', beforeinstallprompt);
    });

    return {
      offline,
      instalPwaDialog,
      onCloseInstallPwaDialog,
      onInstallPwa,
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