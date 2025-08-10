<template>
  <div class="dropdown block-bg" :class="{ 'dropdown--outline': outline }">
    <div class="dropdown_head flex items-center" @click="show = !show">
      <slot name="icon" />
      <h6 class="text-bold dropdown_title q-ma-none">{{ displayTitle }}</h6>
      <q-icon
        :name="show ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        size="sm"
        class="q-ml-auto"
      />
    </div>
    <div v-if="isOpen" class="dropdown_body q-px-md q-pb-md q-pt-none">
      <slot name="body" />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'Dropdown'
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

const { t: $t } = useI18n()

const displayTitle = computed(() => props.title || $t('common.title'))

export default {
  name: 'DropDown',
  props: {
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
}
</script>

<style lang="scss" scoped>
.dropdown {
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);

  &--outline {
    border: 1px solid var(--border-color);
    background-color: transparent;
  }
}
</style>