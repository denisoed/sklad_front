<template>
  <div class="flex flex-center q-mx-auto q-gap-sm q-mt-sm">
    <div class="flex column items-start">
      <p class="full-width btn-sizes-list_desc q-mb-sm">Чтобы выбрать несколько единиц, удерживайте нужный размер пару секунд.</p>
      <div class="flex q-gap-sm">
        <q-btn
          v-for="(s, i) of listSizes.sort((a, b) => a.size - b.size)"
          :key="i"
          color="primary"
          :label="s.size"
          size="lg"
          v-touch-hold.mouse="onHold"
          @click="setSize(s)"
          @mousedown="onMouseDown(s)"
          @touchstart="onMouseDown(s)"
          :outline="!s.selected"
          v-vibrate
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
        <span>Указано размеров:</span>
        <b>{{ countSizes }}шт</b>
      </div>
    </div>
    <q-dialog v-model="dialog" position="bottom">
      <q-card style="width: 350px">
        <q-card-section class="flex no-wrap column row q-gap-md items-center no-wrap q-pb-xl">
          <InputPlusMinusVue
            class="full-width"
            :max="100"
            :model-value="selectedSize.count"
            :label="`Количество единиц для размера <b>${selectedSize.size}</b>`"
            @update:model-value="selectedCounts = $event"
          />
          <q-separator class="full-width" />
          <div class="flex justify-between full-width no-wrap q-gap-md">
            <q-btn
              color="grey"
              icon="mdi-close"
              push
              class="button-size"
              @click="dialog = false"
              v-vibrate
            />
            <q-btn
              class="button-size"
              color="primary"
              icon="mdi-check"
              push
              @click="setSizes"
              v-vibrate
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import InputPlusMinusVue from 'src/components/InputPlusMinus'
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
    InputPlusMinusVue,
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
    const selectedCounts = ref(0)
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

    function setSizes() {
      dialog.value = false
      if (selectedCounts.value !== selectedSize.value.count) {
        if (selectedCounts.value < selectedSize.value.count) {
          const iterator = selectedCounts.value == 0 ? selectedSize.value.count : selectedSize.value.count - selectedCounts.value
          for (let index = 0; index < iterator; index++) {
            removeItemOnce(selectedSizes.value, selectedSize.value.size)
          }
        } else {
          const iterator = selectedCounts.value - selectedSize.value.count   
          for (let index = 0; index < iterator; index++) {
            selectedSizes.value.push(selectedSize.value.size)
          }
        }
        createListSizes(sizes.value, selectedSizes.value)
      }
      selectedCounts.value = 0
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
      selectedCounts,
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
