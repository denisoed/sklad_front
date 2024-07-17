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
              <div class="text-subtitle1">Sklad</div>
              <p class="q-ma-none">Версия 0.0.2</p>
            </div>
          </div>
          <q-separator class="full-width q-my-md" />
          <div class="flex">
            <h6 class="flex q-ma-none q-mb-sm">Как установить Sklad на рабочий стол (Android и iPhone)</h6>
            <p class="q-ma-none text-subtitle2">
              Если вам неудобно использовать Sklad через Telegram, вы можете установить его на рабочий как полноценное приложение. Это позволит быстро и удобно получать доступ к складу без необходимости каждый раз открывать Telegram.
            </p>
          </div>
          <q-separator class="full-width q-my-md" />
          <div class="flex justify-between no-wrap q-gap-md full-width">
            <q-btn
              class="button-size q-mr-auto"
              color="grey"
              label="Не устанавливать"
              push
              @click="close"
              v-vibrate
            />
            <q-btn
              class="button-size"
              color="primary"
              push
              label="Установить"
              @click="install"
              v-vibrate
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
} from 'vue'

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
    function close() {
      emit('on-close')
    }
    
    function install() {
      close()
      emit('on-install')
    }

    return {
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
