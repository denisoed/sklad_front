<template>
  <q-pull-to-refresh
    @refresh="refresh"
    bg-color="dark"
  >
    <div class="flex no-wrap items-center q-mb-md">
      <BtnBack
        v-if="!hideBackBtn"
        class="q-mr-md"
        :link="link"
      />
      <h1 class="page-title_title text-h5 text-weight-bold q-ma-none">
        {{ displayTitle }}
      </h1>
      <slot name="custom" />
      <div v-if="hasSlot" class="q-ml-auto">
        <q-btn
          class="q-ml-md"
          push
          clearable
          round
          size="sm"
          color="white"
          text-color="primary"
          @click="dialog = true"
        >
          <q-icon
            name="mdi-information-variant"
          />
        </q-btn>
        <q-dialog v-model="dialog">
          <q-card class="full-width">
            <q-card-section>
              <div class="text-h6">{{ $t('pages.info') }}</div>
            </q-card-section>
            <slot />
            <q-btn
              round
              push
              color="deep-orange"
              size="sm"
              @click="dialog = false"
              class="absolute-top-right q-mr-md q-mt-md"
            >
              <q-icon
                name="mdi-close"
                color="white"
              />
            </q-btn>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-pull-to-refresh>
</template>

<script>
import {
  computed,
  defineComponent,
  ref
} from 'vue'
import BtnBack from 'src/components/BtnBack.vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'PageTitle'
})

const props = defineProps({
  title: {
    type: String,
    default: null
  },
  hideBackBtn: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null,
  },
})

const { t: $t } = useI18n()

const displayTitle = computed(() => props.title || $t('common.title'))

export default defineComponent({
  name: 'PageTitle',
  components: {
    BtnBack
  },
  setup(props, { slots }) {
    const dialog = ref(false)
    const hasSlot = computed(() => !!slots['default'])

    function refresh() {
      window.location.reload()
    }

    return {
      dialog,
      hasSlot,
      refresh
    }
  }
})
</script>
