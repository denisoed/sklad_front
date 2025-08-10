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
      <h6 v-html="title || $t('common.title')" class="text-h6 q-my-none q-mr-sm" />
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

<script setup>
import {
  computed,
  useSlots,
  ref
} from 'vue'
import BtnBack from 'src/components/BtnBack.vue'

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

const slots = useSlots()

const dialog = ref(false)
const hasSlot = computed(() => !!slots['default'])

function refresh() {
  window.location.reload()
}
</script>
