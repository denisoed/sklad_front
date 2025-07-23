<template>
  <div class="size-count-container">
    <div
      v-for="(s, i) of formattedSizes"
      :key="i"
      class="size-count"
    >
      <q-badge
        v-if="s.count > 1"
        color="red"
        floating
      >
        {{ s.count }}
      </q-badge>
      <span>{{ s.size }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  sizes: {
    type: Array,
    required: true,
  },
});

const formattedSizes = computed(() => {
  return Object.values(props.sizes.reduce((acc, obj) => {
    const size = obj.size;
    acc[size] = acc[size] || { size, count: 0 };
    acc[size].count++;
    return acc;
  }, {}));
})
</script>

<style lang="scss" scoped>
.size-count-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.size-count {
  border: 1px solid var(--q-primary);
  position: relative;
  border-radius: var(--border-radius-sm);
  padding: 0 4px;
  color: var(--q-primary-text);
  font-size: 16px;

  .q-badge {
    top: -12px;
    right: -8px;
  }
}
</style>
