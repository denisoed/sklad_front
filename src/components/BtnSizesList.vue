<template>
  <div class="flex flex-center q-mx-auto q-gap-sm q-mt-sm">
    <div class="flex column items-start">
      <p class="full-width btn-sizes-list_desc q-mb-sm">{{ $t('pages.selectMultiple') }}</p>
      <div class="flex q-gap-sm">
        <q-btn
          v-for="(s, i) of listSizes.sort((a, b) => a.size - b.size)"
          :key="i"
          :color="s.selected ? 'primary' : 'white'"
          :label="s.size"
          class="border-radius-sm"
          v-touch-hold.mouse="onHold"
          @click="setSize(s)"
          @mousedown="onMouseDown(s)"
          @touchstart="onMouseDown(s)"
          :outline="!s.selected"
        >
          <q-badge
            v-if="s.count > 1"
            color="red"
            floating
          >
            {{ s.count }}
          </q-badge>
        </q-btn>
      </div>
      <q-separator class="full-width q-my-sm" />
      <div class="flex full-width justify-between">
        <span>{{ $t('pages.sizesCountSpecified') }}</span>
        <b>{{ countSizes }}{{ $t('common.pieces') }}</b>
      </div>
    </div>
    <SizeCountDialog
      v-model="dialog"
      :selected-size="selectedSize"
      @submit="setSizes"
    />
  </div>
</template>

<script>
import SizeCountDialog from 'src/components/Dialogs/SizeCountDialog.vue'
import {
  defineComponent,
  ref,
  computed,
  toRefs,
  watch,
} from 'vue'

export default defineComponent({
  name: 'BtnSizesList',
  components: {
    SizeCountDialog,
  },
  props: {
    selected: {
      type: Array,
      default: () => []
    },
    sizes: {
      type: Array,
      default: () => []
    }
  },
  emits: ['on-change'],
  setup(props, { emit }) {
    const { selected, sizes } = toRefs(props)
    const dialog = ref(false)
    const selectedSize = ref(null)
    const selectedSizes = ref([])
    const listSizes = ref([])

    function removeItemOnce(arr, size) {
      const index = arr.map(s => s).indexOf(size)
      if (index > -1) {
        arr.splice(index, 1)
      }
      return arr
    }

    function onHold() {
      dialog.value = true
    }

    function setSize(s) {
      if (s.selected) {
        removeItemOnce(selectedSizes.value, s.size)
      } else {
        selectedSizes.value.push(s.size)
      }
      createListSizes(sizes.value, selectedSizes.value)
      emit('on-change', selectedSizes.value.map(size => ({ size })))
    }

    function setSizes(selectedCount) {
      if (selectedCount !== selectedSize.value.count) {
        if (selectedCount < selectedSize.value.count) {
          const iterator = selectedCount == 0 ? selectedSize.value.count : selectedSize.value.count - selectedCount
          for (let index = 0; index < iterator; index++) {
            removeItemOnce(selectedSizes.value, selectedSize.value.size)
          }
        } else {
          const iterator = selectedCount - selectedSize.value.count   
          for (let index = 0; index < iterator; index++) {
            selectedSizes.value.push(selectedSize.value.size)
          }
        }
        createListSizes(sizes.value, selectedSizes.value)
      }
      selectedSize.value = null
      emit('on-change', selectedSizes.value.map(size => ({ size })))
    }
    
    function onMouseDown(size) {
      selectedSize.value = size
    }

    function getCountSize(size, sizes) {
      let count = 0
      sizes.forEach(s => {
        if (s === size) {
          count += 1
        }
      });
      return count
    }

    function createListSizes(list = [], selected = []) {
      const sizesList = [...new Set([...list, ...selected])]
      listSizes.value = sizesList.map(size => {
        const count = getCountSize(size, selected)
        return {
          size,
          count,
          selected: selected.includes(size),
        }
      })
    }

    const countSizes = computed(() => {
      const total = listSizes.value.reduce((prev, next) => {
        const sum = prev + next.count
        return sum
      }, 0);
      return total
    })

    watch(selected, (newValue) => {
      selectedSizes.value = newValue.map(s => s.size)
      createListSizes(sizes.value, newValue.map(s => s.size))
    }, { immediate: true })

    watch(sizes, (val) => {
      createListSizes(val, selected.value.map(s => s.size))
    })

    return {
      onHold,
      dialog,
      selectedSize,
      setSizes,
      setSize,
      listSizes,
      onMouseDown,
      countSizes
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
