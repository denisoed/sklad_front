<template>
  <div class="dropdown block-bg">
    <div @click="toggle" class="dropdown_header flex items-center q-pa-md cursor-pointer">
      <slot name="icon" />
      <span v-html="title" class="text-bold" />
      <div class="dropdown_header-arrow q-ml-auto">
        <q-icon name="mdi-chevron-down" :class="{ 'mdi-rotate-180': isOpen }" size="sm" />
      </div>
    </div>
    <div v-if="isOpen" class="dropdown_body q-px-md q-pb-md q-pt-none">
      <slot name="body" />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'DropDown',
  props: {
    title: {
      type: String,
      default: 'Заголовок'
    },
    opened: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const isOpen = ref(props.opened)

    function close() {
      isOpen.value = false
    }

    function toggle() {
      isOpen.value = !isOpen.value
    }

    return {
      isOpen,
      close,
      toggle
    }
  }
})
</script>

<style lang="scss" scoped>
.dropdown {
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
}
</style>