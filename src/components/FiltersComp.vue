<template>
  <div class="filters flex no-wrap flex-center q-mb-lg">
    <BtnBack
      class="q-mr-md"
    />
    <q-input
      v-model="selectedFilters.name_contains"
      outlined
      debounce="800"
      :label="$t('FiltersComp_10')"
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
          <p class="full-width text-left text-bold q-mb-none text-subtitle1">
            Фильтр по цвету
          </p>
          <ColorPicker
            ref="colorPickerRef"
            :selected="selectedFilters.color"
            @on-change="selectedFilters.color = $event"
          />
        </div>
        <q-separator class="full-width q-my-md" />
        <div class="flex justify-between no-wrap q-gap-md full-width">
          <q-btn
            style="height:40px;"
            color="deep-orange"
            :label="$t('FiltersComp_61')"
            push
            @click="clear"
            v-vibrate
          />
          <q-btn
            class="button-size q-mr-auto"
            color="grey"
            icon="mdi-close"
            push
            @click="leftDrawerOpen = false"
            v-vibrate
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

    function search() {
      emit('on-search', hasFilters.value ? selectedFilters : {})
    }

    function clear() {
      colorPickerRef.value.clear()
      selectedFilters.color = []
      selectedFilters.name_contains = null
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
