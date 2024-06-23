<template>
  <div class="basic-dialog">
    <div @click="onOpen">
      <slot />
    </div>
    <!-- Preview dialog -->
    <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale" :class="[dialogClass]">
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
            v-vibrate
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

<script>
import { defineComponent, ref, toRefs } from 'vue';

export default defineComponent({
  name: 'BasicDialog',
  props: {
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
  },
  setup(props) {
    const { disabled } = toRefs(props);
    const dialog = ref(false);

    function onOpen() {
      if (!disabled.value) {
        dialog.value = true;
      }
    }
    
    function close() {
      dialog.value = false;
    }

    return {
      dialog,
      onOpen,
      close
    };
  },
});
</script>
