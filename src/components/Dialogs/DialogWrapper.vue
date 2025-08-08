<template>
  <q-dialog
    v-if="rendered"
    v-model="dialog"
    class="dialog-wrapper"
    v-bind="$attrs"
  >
    <SwipeToClose
      :direction="directionClose"
      @on-close="() => onClose(id)"
    >
      <template v-if="rendered">
        <slot :data="slotData" />
      </template>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import { onUnmounted, ref } from 'vue';
import useEventBus from 'src/modules/useEventBus/index';
import SwipeToClose from 'src/components/SwipeToClose.vue';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  directionClose: {
    type: String,
    default: 'down',
  },
})

const { offBus, onBus, BUS_EVENTS } = useEventBus();
const dialog = ref(false);
const rendered = ref(false);
const slotData = ref();

function onOpen(data) {
  if (props.id === data?.id) {
    if (data) slotData.value = data;
    rendered.value = true;
    dialog.value = true;
  }
}

function onClose(id) {
  if (props.id === id) {
    dialog.value = false;
    // INFO: This is a workaround so that the dialog will have time to send a "hide" event.
    setTimeout(() => {
      rendered.value = false;
      slotData.value = undefined;
    }, 500);
  }
}

onBus(BUS_EVENTS.OPEN_DIALOG, onOpen);
onBus(BUS_EVENTS.CLOSE_DIALOG, onClose);

onUnmounted(() => {
  offBus(BUS_EVENTS.OPEN_DIALOG);
  offBus(BUS_EVENTS.CLOSE_DIALOG);
});
</script>
