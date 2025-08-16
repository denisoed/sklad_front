<template>
  <div class="feedback">
    <!-- Button -->
    <div @click="open">
      <slot />
    </div>

    <!-- Popup -->
    <q-dialog
      v-model="isPopupOpen"
      class="feedback_popup"
    >
      <q-swipe-to-close
        @update:model-value="close"
        direction="down"
        style="width: 350px"
      >
        <q-card class="full-width">
          <q-card-section class="flex no-wrap column row items-center no-wrap">
            <div class="feedback_popup-content full-width flex column items-center q-gap-md">
              
              <template v-if="!selectedRating">
                <div class="feedback_popup-header text-subtitle1 text-center">
                  {{ t('feedback.howEasyToUse') }}
                </div>
  
                <div class="feedback_popup-body" :class="{ selectedRating }">
                  <div class="feedback_popup-body_buttons flex q-gap-md">
                    <q-btn
                      v-for="(b, i) in BUTTONS"
                      :key="i"
                      v-ripple
                      flat
                      round
                      @click="select(b.rating)"
                    >
                      <div class="feedback_popup-body_buttons_img">
                        <q-img
                          :src="b.src"
                          :alt="b.alt"
                        />
                      </div>
                    </q-btn>
                  </div>
                </div>
              </template>

              <div
                v-else
                class="feedback_popup-form full-width flex column items-center q-gap-md"
              >
                <div class="feedback_popup-form_text flex items-center justify-between full-width text-subtitle1">
                  <span>{{ t('feedback.addComment') }}</span>
                  <q-img :src="selectedRatingImg" />
                </div>
                <q-input
                  v-model="comment"
                  outlined
                  type="textarea"
                  :placeholder="$t('product.writeEverything')"
                  rows="4"
                  maxlength="500"
                  counter
                  class="full-width"
                />
                <div class="flex q-gap-md">
                  <q-btn
                    color="grey"
                    push
                    @click="select(null)"
                  >
                    {{ t('feedback.back') }}
                  </q-btn>
                  <q-btn
                    color="primary"
                    push
                    :loading="sending"
                    @click="send"
                  >
                    {{ t('feedback.send') }}
                  </q-btn>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-swipe-to-close>
    </q-dialog>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed
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
  name: 'CreateDialog',
  setup() {
    const { createFeedback, errorFeedback } = useFeedback()
    const { showSuccess, showError } = useHelpers()
    const { t } = useI18n()

    const isPopupOpen = ref(false);
    const selectedRating = ref(null);
    const comment = ref(null);
    const sending = ref(false);

    const selectedRatingImg = computed(() => BUTTONS.find(b => b.rating === selectedRating.value)?.src);

    function select(type) {
      selectedRating.value = type;
    }
    
    async function send() {
      try {
        sending.value = true;
        await createFeedback({ rating: selectedRating.value, comment: comment.value })
        if (errorFeedback.value) {
          showError(t('feedback.unknownError'))
        } else {
          showSuccess(t('feedback.feedbackSent'))
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
      sending,
      selectedRatingImg,
      t
    };
  }
});
</script>

<style lang="scss" scoped>
.feedback {
  &_popup-body_buttons {
    &_img {
      width: 40px;

      .q-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }

  &_popup-form_text {
    .q-img {
      width: 25px;
    }
  }
}
</style>