<template>
  <div class="feedback">
    <!-- Button -->
    <div @click="open" v-vibrate>
      <slot />
    </div>

    <!-- Popup -->
    <q-dialog
      v-model="isPopupOpen"
      class="create-dialog"
      position="bottom"
    >
      <q-swipe-to-close
        @update:model-value="close"
        direction="down"
        style="width: 350px"
      >
        <q-card class="full-width">
          <div class="swipe-line" />
          <q-card-section class="flex no-wrap column row items-center no-wrap">
          </q-card-section>
        </q-card>
      </q-swipe-to-close>
    </q-dialog>
  </div>
</template>

<script>
import {
  defineComponent,
  ref
} from 'vue';
import useFeedback from 'src/modules/useFeedback'
import useHelpers from 'src/modules/useHelpers'
import { useI18n } from 'vue-i18n'

import verybadImg from 'src/assets/feedback/verybad.svg';
import badImg from 'src/assets/feedback/bad.svg';
import goodImg from 'src/assets/feedback/good.svg';
import verygoodImg from 'src/assets/feedback/verygood.svg';
import bestImg from 'src/assets/feedback/best.svg';

const BUTTONS = [
  {
    src: verybadImg,
    rating: 1,
    alt: 'Very bad'
  },
  {
    src: badImg,
    rating: 2,
    alt: 'Bad'
  },
  {
    src: goodImg,
    rating: 3,
    alt: 'Normal'
  },
  {
    src: verygoodImg,
    rating: 4,
    alt: 'Good'
  },
  {
    src: bestImg,
    rating: 5,
    alt: 'Best'
  },
]

export default defineComponent({
  name: 'FeedbackDialog',
  setup() {
    const { createFeedback, errorFeedback } = useFeedback()
    const { showSuccess, showError } = useHelpers()
    const { t: $t } = useI18n()

    const isPopupOpen = ref(false);
    const selectedRating = ref(null);
    const comment = ref(null);
    const sending = ref(false);

    function select(type) {
      selectedRating.value = type;
    }
    
    async function send() {
      try {
        sending.value = true;
        await createFeedback({ rating: selectedRating.value, comment: comment.value })
        if (errorFeedback.value) {
          showError($t('index_91'))
        } else {
          showSuccess($t('index_93'))
        }
      } finally {
        sending.value = false;
        selectedRating.value = null;
        close();
      }
    }

    function open() {
      isPopupOpen.value = true;
    }

    function close() {
      isPopupOpen.value = false;
      selectedRating.value = null;
    }

    return {
      isPopupOpen,
      selectedRating,
      comment,
      select,
      send,
      open,
      close,
      BUTTONS,
      sending
    };
  }
});
</script>

<style lang="scss" scoped>
  .swipe-line {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
