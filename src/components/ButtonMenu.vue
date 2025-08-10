<template>
  <div class="button-menu">
    <div
      class="button-menu_list flex column items-center full-width"
      :class="{ 'button-menu_list--expanded': showSubbuttons }"
    >
      <q-btn
        icon="mdi-qrcode-scan"
        round
        push
        size="md"
        color="primary"
        class="q-mb-md"
        @click="onQRClick"
      />
      <q-btn
        icon="mdi-view-list"
        round
        push
        size="md"
        color="primary"
        @click="onListClick"
      />
    </div>
    <q-btn
      icon="search"
      round
      push
      size="lg"
      color="primary"
      @click="toggleSubbuttons"
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { Platform } from 'quasar';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'ButtonMenu',

  setup() {
    const { push } = useRouter()
    const { t: $t } = useI18n()

    const showSubbuttons = ref(false);

    function onQRClick() {
      if (Platform.is.cordova) {
        cordova.plugins.barcodeScanner.scan(
          (result) => {
            if (!result.cancelled) {
              push(result.text);
            }
          },
          () => { },
          {
            preferFrontCamera: false, // iOS and Android
            showFlipCameraButton: true, // iOS and Android
            showTorchButton: true, // iOS and Android
            torchOn: true, // Android, launch with the torch switched on (if available)
            saveHistory: true, // Android, save scan history (default false)
            prompt: $t('scanner.qrPrompt'), // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
            orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations: true, // iOS
            disableSuccessBeep: false // iOS and Android
          }
        );
      } else if (Platform.is.mobile || Platform.is.desktop) {
        qrModalOpened.value = true
      }
    }

    function onListClick() {
      push('/products');
    }

    function toggleSubbuttons() {
      if (Platform.is.cordova) {
        showSubbuttons.value = !showSubbuttons.value;
      } else {
        onListClick();
      }
    }

    return {
      showSubbuttons,
      toggleSubbuttons,
      onQRClick,
      onListClick
    };
  },
});
</script>

<style lang="scss">
.button-menu {
  position: relative;

  &_list {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 0;
    z-index: 0;
    border-radius: 40px;
    display: none;
    background: rgba($color: #fff, $alpha: 0.6);
    padding: 9px;
    animation: jump 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &--expanded {
      height: 185px;
      display: block;
    }
  }
}

@keyframes jump {
  0% {
    transform: translatey(0px) scaley(100%);
  }
  35% {
    transform: translatey(-5px) scaley(101%);
  }
  70% {
    transform: translatey(5px) scaley(99%);
  }
  100% {
    transform: translatey(0px) scaley(100%);
  }
}
</style>
