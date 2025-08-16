<template>
  <div
    v-if="color"
    class="color-display"
    :style="{ backgroundColor: color }"
    :title="color"
  />
</template>

<script setup>

defineProps({
  color: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: '20px'
  }
})
</script>

<style lang="scss" scoped>
.color-display {
  width: v-bind(size);
  height: v-bind(size);
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  display: inline-block;
  flex-shrink: 0;
}
</style> 