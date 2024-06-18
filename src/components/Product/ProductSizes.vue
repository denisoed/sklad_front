<template>
  <div class="product-sizes border-section">
    <div class="q-pa-xs">
      <q-radio
        v-model="typeId"
        v-for="(s, i) of sizes"
        :val="s.id"
        :key="i"
        :label="s.name"
        :disable="selected.length > 0"
      />
    </div>
    <div v-if="typeSizes" class="flex no-wrap q-gap-sm items-start q-px-md q-mb-md">
      <BtnSizesList
        :selected="selectedSizes"
        :sizes="typeSizes.list.map(l => l.size)"
        @on-change="onChangeSizes"
      />
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  toRefs,
  watch,
  computed
} from 'vue'
import BtnSizesList from 'src/components/BtnSizesList.vue'

export default defineComponent({
  name: 'ProductSizes',
  components: {
    BtnSizesList,
  },
  props: {
    sizes: {
      type: Array,
      default: () => []
    },
    selected: {
      type: Array,
      default: () => []
    },
    typeSizeId: {
      type: Number,
      default: null
    }
  },
  emits: ['on-change'],
  setup(props, { emit }) {
    const { selected, sizes, typeSizeId } = toRefs(props);

    const selectedSizes = ref([]);
    const typeId = ref(null);

    const typeSizes = computed(() => sizes.value.find(s => s.id === typeId.value))

    function onChangeSizes(list) {
      emit('on-change', { id: typeId.value, list });
    }

    watch(typeSizeId, (val) => {
      if (val) {
        typeId.value = String(val)
      }
    }, {
      immediate: true,
    })

    watch(typeId, () => {
      selectedSizes.value = [];
    })

    watch(selected, (val) => {
      selectedSizes.value = val;
    }, {
      immediate: true
    })

    return {
      onChangeSizes,
      selectedSizes,
      typeId,
      typeSizes
    }
  }
})
</script>
