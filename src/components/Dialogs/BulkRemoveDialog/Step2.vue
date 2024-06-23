<template>
  <div class="flex column q-gap-md">
    <q-separator />
    <div class="text-subtitle1">При удалении товаров, они пропадут со склада навсегда!</div>
    <q-separator />
    <div class="flex no-wrap sjustify-end q-gap-md">
      <q-btn
        style="width:100%;height:40px;"
        color="grey"
        icon="mdi-arrow-left"
        push
        @click="prev"
        v-vibrate
      />
      <q-btn
        style="width:100%;height:40px;"
        color="primary"
        icon="mdi-check"
        push
        :disable="isDisabled"
        @click="submit"
        v-vibrate
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BulkRemoveStep2',
  emits: ['on-prev', 'on-submit'],
  setup(props, { emit }) {
    function submit() {
      emit('on-submit')
    }
    function prev() {
      emit('on-prev')
    }

    return {
      prev,
      submit,
    }
  }
})
</script>
