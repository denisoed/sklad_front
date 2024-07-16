<template>
  <div class="filters flex no-wrap flex-center q-mb-lg">
    <BtnBack
      class="q-mr-md"
    />
    <q-input
      v-model="selectedFilters.name_contains"
      outlined
      debounce="800"
      label="Поиск по имени товара"
      class="full-width block-bg"
      dense
      :autofocus="autofocus"
      clearable
      @update:model-value="search"
    >
      <template v-if="!selectedFilters.name_contains" #append>
        <q-icon name="search" />
      </template>
    </q-input>
    <q-btn
      class="q-ml-md"
      push
      clearable
      round
      size="md"
      color="white"
      text-color="black"
      @click="toggleLeftDrawer"
      v-vibrate
    >
      <q-icon
        name="mdi-tune"
      />
      <div v-if="hasFilters" class="alert_dot" />
    </q-btn>

    <!-- Menu -->
    <q-dialog
      v-model="leftDrawerOpen"
      position="bottom"
      class="q-pa-md"
    >
    <q-card style="width: 385px">
      <q-card-section class="flex items-center no-wrap column row items-center no-wrap q-pb-xl">
        <div class="flex items-center no-wrap column full-width q-gap-sm">
          <h6 class="full-width text-left text-bold q-ma-none text-subtitle1">
            Фильтры
          </h6>
          <q-separator class="full-width q-my-xs" />
          <div v-permissions="[READ_ORIGINAL_PRICE]" class="flex column items-start full-width q-gap-sm q-mb-sm">
            <h6 class="q-ma-none text-subtitle2 text-left">По оптовой цене</h6>
            <div class="flex items-center no-wrap full-width q-gap-md">
              <q-input
                v-model="selectedFilters.origPrice_gt"
                outlined
                placeholder="От"
                dense
                height="50px"
                type="number"
                pattern="[0-9]*"
                inputmode="numeric"
                class="full-width"
                debounce="500"
              />
              <q-input
                v-model="selectedFilters.origPrice_lt"
                outlined
                placeholder="До"
                dense
                height="50px"
                type="number"
                debounce="500"
                pattern="[0-9]*"
                inputmode="numeric"
                class="full-width"
              />
            </div>
          </div>
          <div class="flex column items-start full-width q-gap-sm q-mb-sm">
            <h6 class="q-ma-none text-subtitle2 text-left">По розничной цене</h6>
            <div class="flex items-center no-wrap full-width q-gap-md">
              <q-input
                v-model="selectedFilters.newPrice_gt"
                outlined
                placeholder="От"
                dense
                height="50px"
                type="number"
                pattern="[0-9]*"
                inputmode="numeric"
                class="full-width"
                debounce="500"
              />
              <q-input
                v-model="selectedFilters.newPrice_lt"
                outlined
                placeholder="До"
                dense
                height="50px"
                type="number"
                debounce="500"
                pattern="[0-9]*"
                inputmode="numeric"
                class="full-width"
              />
            </div>
          </div>
          <div class="flex column items-start full-width">
            <h6 class="q-ma-none text-subtitle2 text-left">По цвету</h6>
            <ColorPicker
              ref="colorPickerRef"
              :selected="selectedFilters.color"
              @on-change="selectedFilters.color = $event"
            />
          </div>
        </div>
        <q-separator class="full-width q-my-md" />
        <div class="flex justify-between no-wrap q-gap-md full-width">
          <q-btn
            color="deep-orange"
            label="Сбросить"
            push
            @click="clear"
            v-vibrate
            class="button-size"
          />
          <q-btn
            class="button-size"
            color="primary"
            icon="mdi-check"
            push
            @click="leftDrawerOpen = false"
            v-vibrate
          />
        </div>
      </q-card-section>
    </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  ref,
  reactive,
  watch,
} from 'vue'
import { READ_ORIGINAL_PRICE } from 'src/permissions';

import ColorPicker from 'src/components/ColorPicker.vue'
import BtnBack from 'src/components/BtnBack.vue'

export default defineComponent({
  name: 'FiltersComp',
  components: {
    ColorPicker,
    BtnBack
  },
  props: {
    autofocus: {
      type: Boolean,
      default: false
    }
  },
  emits: ['on-search'],
  setup(props, { emit }) {
    const leftDrawerOpen = ref(false)
    const colorPickerRef = ref(null)
    const scrolledTop = ref(0)
    const selectedFilters = reactive({
      color: [],
      origPrice_gt: null,
      origPrice_lt: null,
      newPrice_gt: null,
      newPrice_lt: null,
      name_contains: null
    })
    const hasFilters = computed(() => Object.values(selectedFilters).some(f => f?.length));

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value
      if (window.innerWidth < 1024) {
        const sTop = window.scrollY
        scrolledTop.value = 50 - (sTop >= 50 ? 50 : sTop - 10)
      }
    }

    function setSize(size) {
      if (selectedFilters.sizes.some(s => s === size)) {
        selectedFilters.sizes = selectedFilters.sizes.filter(s => s !== size)
      } else {
        selectedFilters.sizes.push(size)
      }
    }

    function filterInvalid(obj) {
      return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v))
    }

    function search() {
      emit('on-search', hasFilters.value ? filterInvalid(selectedFilters) : {})
    }

    function clear() {
      colorPickerRef.value.clear()
      selectedFilters.color = []
      selectedFilters.name_contains = null
      selectedFilters.origPrice_gt = 0
      selectedFilters.origPrice_lt = 0
      toggleLeftDrawer()
    }

    watch(selectedFilters, () => {
      search()
    })

    return {
      toggleLeftDrawer,
      setSize,
      clear,
      search,
      leftDrawerOpen,
      scrolledTop,
      selectedFilters,
      colorPickerRef,
      hasFilters,
      READ_ORIGINAL_PRICE
    }
  }
})
</script>

<style lang="scss" scoped>
.filters {
  position: sticky;
  top: 10px;
  z-index: 10;

  .alert_dot {
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background-color: red;
    position: absolute;
    right: 0px;
    top: 0px;
    transition: all 0.2s ease;
  }

  .pulse-animation {
    position: absolute;
    background-color: var(--deep-orange);
    border: 5px solid var(--deep-orange);
    border-radius: 50%;
    animation: pulsate infinite 1.5s;
  }

  @keyframes pulsate {
    0% {
      transform: scale(1, 1);
      opacity: 1;
    }
    100% {
      transform: scale(1.3, 1.3);
      opacity: 0;
    }
  }
}
</style>
