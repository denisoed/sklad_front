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
      />
      <q-btn
        style="width:100%;height:40px;"
        color="primary"
        icon="mdi-check"
        push
        :loading="loading"
        :disable="loading"
        @click="submit"
      />
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'StepTwo',
})

const emit = defineEmits(['on-prev', 'on-submit'])

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

function submit() {
  emit('on-submit')
}

function prev() {
  emit('on-prev')
}
</script> 