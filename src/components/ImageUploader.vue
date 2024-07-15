<template>
  <div
    class="image-uploader"
    :class="`image-uploader--${size} ${circle ? 'image-uploader--circle' : ''}`"
    v-ripple
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
      v-vibrate
    />

    <q-file
      v-else
      outlined
      :model-value="imagePreview"
      :hint="hint || undefined"
      :rules="rules"
      @update:model-value="onChangeImage"
    >
      <span>
        <q-icon name="mdi-image-plus" class="q-mr-sm" />
        {{ $t('uploadPhoto') }}
      </span>
    </q-file>
    
    <div
      v-if="imagePreview"
      class="flex column absolute-top-right q-mr-md q-mt-md"
    >
      <q-btn
        round
        push
        color="white"
        size="sm"
        @click="zoomImage"
        v-vibrate
      >
        <q-icon
          name="mdi-eye"
          color="black"
        />
      </q-btn>
      <q-btn
        round
        push
        class="q-mt-md"
        color="deep-orange"
        size="sm"
        @click="clear"
        v-vibrate
      >
        <q-icon
          name="mdi-image-remove"
          color="white"
        />
      </q-btn>
    </div>

    <!-- Dialog -->
    <q-dialog v-model="dialog" position="bottom">
      <q-card class="full-width image-uploader_dialog-card">
        <q-img
          :src="imagePreview"
          spinner-size="md"
          spinner-color="grey"
        />
        <q-btn
          round
          push
          color="deep-orange"
          size="sm"
          @click="dialog = false"
          class="absolute-top-right q-mr-md q-mt-md"
          v-vibrate
        >
          <q-icon
            name="mdi-close"
            color="white"
          />
        </q-btn>
      </q-card>
    </q-dialog>

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
import {
  defineComponent,
  ref,
  toRefs,
  watch
} from 'vue'

const MAX_SIZE = 4096

export default defineComponent({
  name: 'ImageUploader',
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
    const { image } = toRefs(props)
    const { showError } = useHelpers()
    const {
      formatFileToBase64
    } = useImage()

    const imagePreview = ref(image.value)
    const isLoading = ref(false)
    const dialog = ref(false)

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
          showError(`File size must be less than ${MAX_SIZE} KB.`)
          return
        }
        emit('on-change', compressedImage)
      } catch (error) {
        showError(error)
      } finally {
        isLoading.value = false
      }
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
    }
  },
})
</script>

<style lang="scss">
  .image-uploader {
    width: 100%;
    height: 210px;
    border-radius: 4px;
    overflow: hidden;
    text-align: center;
    position: relative;
    overflow: hidden;

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
          border-radius: var(--border-radius);
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
        opacity: 0.3;
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

    &_dialog-card {
      min-width: 300px;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fff;
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
