<template>
  <q-dialog
    :model-value="opened"
    position="bottom"
    persistent
    @update:model-value="close"
  >
    <q-card style="width: 350px" class="install-pwa">
      <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
        <div class="flex justify-start full-width q-mt-sm">
          <div class="flex">
            <q-img src="icons/favicon-128x128.png" class="install-pwa_logo q-mr-sm" />
            <div class="flex column items-start">
              <div class="text-subtitle1">{{ $t('app.name') }}</div>
              <p class="q-ma-none">{{ $t('app.version', { version: '0.0.2' }) }}</p>
            </div>
          </div>
          <q-separator class="full-width q-my-md" />
          <div class="flex column no-wrap">
            <h6 class="flex q-ma-none q-mb-sm">{{ $t('pwa.attention') }}</h6>
            <p class="q-ma-none text-subtitle2">
              {{ $t('pwa.installDescription') }}
            </p>
          </div>
          <q-separator class="full-width q-my-md" />
          <div class="flex justify-between no-wrap q-gap-md full-width">
            <q-btn
              class="button-size q-mr-auto"
              color="grey"
              :label="$t('common.notInstall')"
              push
              @click="close"
            />
            <q-btn
              class="button-size"
              color="primary"
              push
              :label="$t('common.install')"
              @click="install"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import {
  defineComponent,
  ref,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { usePwa } from 'src/composables/usePwa'
import DialogWrapper from 'src/components/Dialogs/DialogWrapper.vue'

defineOptions({
  name: 'InstallPwaDialog'
})

const { t: $t } = useI18n()
const { isInstallPromptAvailable } = usePwa()

export default defineComponent({
  name: 'InstallPwaDialog',
  props: {
    opened: {
      type: Boolean,
      default: false
    },
  },
  emits: ['on-close', 'on-install'],
  setup(props, { emit }) {
    const { t: $t } = useI18n()
    
    function close() {
      emit('on-close')
    }
    
    function install() {
      emit('on-install')
    }

    return {
      $t,
      close,
      install
    }
  }
})
</script>

<style lang="scss" scoped>
.install-pwa {
  &_logo {
    width: 50px;
    height: 50px;
  }
}
</style>
