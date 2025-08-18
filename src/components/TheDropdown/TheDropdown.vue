<template>
  <div class="dropdown block-bg" :class="{ 'dropdown--outline': outline }">
    <div @click="toggle" class="dropdown_header flex items-center q-pa-md cursor-pointer">
      <slot name="icon" />
      <span v-html="title || $t('common.title')" class="text-bold" />
      <div class="dropdown_header-arrow q-ml-auto">
        <q-icon name="mdi-chevron-down" :class="{ 'mdi-rotate-180': isOpen }" size="sm" />
      </div>
    </div>
    <div v-if="isOpen" class="dropdown_body q-px-md q-pb-md q-pt-none">
      <slot name="body" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'TheDropdown'
})

const props = defineProps({
  title: {
    type: String,
    default: null
  },
  opened: {
    type: Boolean,
    default: false
  },
  outline: {
    type: Boolean,
    default: false
  }
})

const isOpen = ref(props.opened)

function close() {
  isOpen.value = false
}

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<style lang="scss" scoped>
.dropdown {
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius-sm);

  &--outline {
    border: 1px solid var(--border-color);
    background-color: transparent;
  }
}
</style>