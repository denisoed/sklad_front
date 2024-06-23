<template>
  <div class="flex no-wrap items-center q-mb-md">
    <BtnBack
      v-if="!hideBackBtn"
      class="q-mr-md"
      :link="link"
    />
    <h6 v-html="title" class="text-h6 q-my-none" />
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
        v-vibrate
      >
        <q-icon
          name="mdi-information-variant"
        />
      </q-btn>
      <q-dialog v-model="dialog">
        <q-card class="full-width">
          <q-card-section>
            <div class="text-h6">Инфо</div>
          </q-card-section>
          <slot />
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
    </div>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  ref
} from 'vue'
import BtnBack from 'src/components/BtnBack.vue'

export default defineComponent({
  name: 'PageTitle',
  components: {
    BtnBack
  },
  props: {
    title: {
      type: String,
      default: 'Заголовок'
    },
    hideBackBtn: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: null,
    },
  },
  setup(props, { slots }) {
    const dialog = ref(false)
    const hasSlot = computed(() => !!slots['default'])

    return {
      dialog,
      hasSlot
    }
  }
})
</script>
