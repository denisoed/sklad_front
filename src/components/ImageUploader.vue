<template>
  <div
    class="image-uploader border-radius-md"
    :class="{
      'image-uploader--sm': size === 'sm',
      'image-uploader--circle': circle,
    }"
  >
    <q-img
      v-if="imagePreview"
      :src="imagePreview"
      @click="zoomImage"
      height="100%"
      fit="cover"
      spinner-size="md"
      spinner-color="grey"
      class="cursor-pointer absolute-top-left full-width full-height"
    />

    <template v-else>
      <div class="full-width full-height" v-ripple>
        <q-file
          outlined
          :model-value="imagePreview"
          :hint="hint || undefined"
          :rules="rules"
          @update:model-value="onChangeImage"
        >
          <span>
            <q-icon name="mdi-image-plus" class="q-mr-sm" />
            {{ $t('common.uploadPhoto') }}
          </span>
        </q-file>
      </div>
      
      <!-- Hidden camera input -->
      <input
        ref="cameraInput"
        type="file"
        accept="image/*"
        capture="environment"
        @change="onCameraSelected"
        style="display: none;"
      />
  
      <!-- Open camera button (mobile only) -->
      <q-btn
        v-if="isMobile"
        round
        push
        color="primary"
        class="absolute-bottom-right image-uploader_camera-button"
        @click.stop="openCamera"
      >
        <q-icon name="mdi-camera" color="white" />
      </q-btn>
    </template>

    <div
      v-if="imagePreview"
      class="flex column absolute-bottom-right q-mr-sm q-mb-sm"
    >
      <q-btn
        round
        push
        color="deep-orange"
        @click="clear"
      >
        <q-icon
          name="mdi-trash-can-outline"
          color="white"
        />
      </q-btn>
    </div>

    <!-- Dialog -->
    <ImagePreviewDialog
      v-model="dialog"
      :image-src="imagePreview"
    />

    <!-- Loader -->
    <q-inner-loading
      :showing="isLoading"
      size="sm"
      style="z-index: 10;"
    />
  </div>
</template>

<script>
import useHelpers from 'src/modules/useHelpers'
import imageCompression from 'browser-image-compression'
import useImage from 'src/modules/useImage'
import ImagePreviewDialog from 'src/components/ImagePreviewDialog.vue'
import { useQuasar } from 'quasar'
import {
  defineComponent,
  ref,
  toRefs,
  watch
} from 'vue'

const MAX_SIZE = 4096

export default defineComponent({
  name: 'ImageUploader',
  components: {
    ImagePreviewDialog
  },
  props: {
    image: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: null,
    },
    hint: {
      type: String,
      default: null,
    },
    circle: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: Array,
      default: () => []
    }
  },
  emits: ['on-change'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const { image } = toRefs(props)
    const { showError } = useHelpers()
    const {
      formatFileToBase64
    } = useImage()

    const imagePreview = ref(image.value)
    const isLoading = ref(false)
    const dialog = ref(false)
    const cameraInput = ref(null)
    const isMobile = $q.platform.is.mobile

    // ---------- Methods ---------- //
    async function zoomImage() {
      dialog.value = true
    }

    function clear() {
      imagePreview.value = null
      emit('clear')
    }

    async function onChangeImage(image) {
      isLoading.value = true
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      }
      try {
        const compressedImage = await imageCompression(image, options)
        const fileSize = (compressedImage.size / 1000)
        if (fileSize >= MAX_SIZE) {
          showError($t('validation.fileSizeLessThan', { size: MAX_SIZE }))
          return
        }
        emit('on-change', compressedImage)
      } catch (error) {
        showError(error)
      } finally {
        isLoading.value = false
      }
    }

    function openCamera() {
      if (cameraInput.value) {
        cameraInput.value.click()
      }
    }

    async function onCameraSelected(event) {
      const fileList = event?.target?.files
      const file = fileList && fileList[0]
      if (!file) return
      await onChangeImage(file)
      // reset input to allow selecting the same file again
      event.target.value = null
    }

    watch(image, async (newValue) => {
      if (!newValue) return
      if (typeof newValue === 'string') {
        imagePreview.value = newValue
      } else {
        imagePreview.value = await formatFileToBase64(newValue)
      }
    }, {
      immediate: true
    })

    return {
      onChangeImage,
      imagePreview,
      isLoading,
      zoomImage,
      dialog,
      clear,
      cameraInput,
      openCamera,
      onCameraSelected,
      isMobile,
    }
  },
})
</script>

<style lang="scss">
  .image-uploader {
    width: 100%;
    height: 210px;
    overflow: hidden;
    text-align: center;
    position: relative;
    overflow: hidden;

    &_camera-button {
      bottom: 32px;
      right: 12px;
      z-index: 10;
    }

    .q-file {
      width: 100%;
      height: 100%;
      position: relative;

      .q-field__control {
        height: 100%;
        padding-top: 5px;
        padding-bottom: 5px;
        justify-content: center;
        position: relative;

        &::before,
        &::after {
          border-width: 2px;
          border-style: dashed;
          border-radius: var(--border-radius-md);
        }

        .q-field__append {
          position: absolute;
          top: 0;
          right: 16px;
        }
      }

      span {
        font-size: 16px;
        font-weight: bold;
        opacity: 0.5;
        display: flex;
        align-items: center;
        pointer-events: none;
        user-select: none;
        color: var(--text-black);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }



    &--sm {
      width: 30px;
      min-width: 30px;
      height: 30px;
      min-height: 30px;
      border-radius: 4px;

      span {
        font-size: 16px;
        line-height: normal;
      }
    }

    &--zoom {
      cursor: pointer;
    }

    &--circle {
      border-radius: 100%;
    }
  }
</style>
