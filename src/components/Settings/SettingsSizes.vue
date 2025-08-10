<template>
  <div class="flex flex-center q-mx-auto q-gap-sm q-my-sm q-mt-md">
    <q-btn
      v-for="(s, i) of sizes"
      :key="i"
      color="primary"
      :label="s"
      :disable="disable"
      size="lg"
      outline
      v-touch-hold.mouse="onHold"
      @mousedown="onMouseDown(s)"
      @touchstart="onMouseDown(s)"
    />
    <p class="full-width btn-sizes-list_desc text-center q-mb-none">{{ $t('pages.deleteSize') }}</p>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
} from 'vue'

export default defineComponent({
  name: 'SettingsSizes',
  props: {
    disable: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Array,
      default: () => []
    },
    sizes: {
      type: Array,
      default: () => []
    }
  },
  emits: ['remove'],
  setup(props, { emit }) {
    const dialog = ref(false)
    const selectedSize = ref(null)

    function close() {
      dialog.value = false
      selectedSize.value = null
    }

    function remove() {
      emit('remove', selectedSize.value)
      close()
    }
    
    function onMouseDown(size) {
      selectedSize.value = size
    }

    function onHold() {
      dialog.value = true
      remove()
    }

    return {
      onHold,
      dialog,
      selectedSize,
      onMouseDown,
      remove
    }
  }
})
</script>

<style lang="scss" scoped>
  .btn-sizes-list {
    &_desc {
      font-size: 12px;
      color: var(--text-description);
    }
  }
</style>
