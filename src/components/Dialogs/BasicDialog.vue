<template>
  <div class="basic-dialog">
    <div @click="onOpen">
      <slot />
    </div>
    <!-- Preview dialog -->
    <q-dialog
      v-model="dialog"
      persistent
      transition-show="scale"
      transition-hide="scale"
      :class="[dialogClass]"
      @hide="$emit('on-close')"
    >
      <q-card :style="`width: ${width};max-width: ${width}`" class="full-width q-pa-md">
        <div class="row items-center q-py-none q-mb-md">
          <div class="text-h6">{{ title }}</div>
          <q-space />
          <q-btn
            round
            push
            color="deep-orange"
            size="sm"
            v-close-popup
          >
            <q-icon
              name="mdi-close"
              color="white"
            />
          </q-btn>
        </div>
        <slot name="content" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, toRefs } from 'vue';

const emit = defineEmits(['on-close'])

const props = defineProps({
  width: {
    type: String,
    default: 'auto',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  dialogClass: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: 'Dialog Title',
  },
})

const { disabled } = toRefs(props);
const dialog = ref(false);

function onOpen() {
  if (!disabled.value) {
    dialog.value = true;
  }
}
</script>
