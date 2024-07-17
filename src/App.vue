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
import { defineComponent, onMounted, ref } from 'vue'
import { SKLAD_PWA_INSTALLED } from 'src/config'

import InstallPwaDialog from 'src/components/Dialogs/InstallPwaDialog.vue'

export default defineComponent({
  name: 'App',
  components: {
    InstallPwaDialog,
  },
  setup() {
    const offline = ref(false);
    const instalPwaDialog = ref(false);

    function checkInstallPwa() {
      if (!LocalStorage.getItem(SKLAD_PWA_INSTALLED)) {
        instalPwaDialog.value = true;
      }
    }

    function onCloseInstallPwaDialog() {
      instalPwaDialog.value = false;
      LocalStorage.set(SKLAD_PWA_INSTALLED, true);
    }

    function onInstallPwa() {
      window.open('https://sklad.work/#/post/1', '_blank');
    }

    onMounted(() => {
      window.addEventListener('online', () => {
        offline.value = false;
      });
      
      window.addEventListener('offline', () => {
        offline.value = true;
      });

      checkInstallPwa();
    });

    return {
      offline,
      instalPwaDialog,
      onCloseInstallPwaDialog,
      onInstallPwa
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