<template>
  <div class="selector">
    <q-select
      :model-value="selectedOption"
      @update:model-value="setSelectedOption"
      :options="options"
      v-bind="$attrs"
    >
      <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
        <q-item v-bind="itemProps">
          <q-item-section side>
            <q-checkbox :model-value="selected" @update:model-value="toggleOption(opt)" />
          </q-item-section>
          <q-item-section>
            <q-item-label v-html="opt.label" />
          </q-item-section>
        </q-item>
      </template>
      <template #no-option>
        <q-btn
          flat
          color="primary"
          class="full-width"
          icon="mdi-plus"
          @click="openedModal = true"
        >
          Создать {{ titlePostfix }}
        </q-btn>
      </template>
      <template #after-options>
        <q-btn
          flat
          color="primary"
          class="full-width"
          icon="mdi-plus"
          @click="openedModal = true"
        >
          Создать {{ titlePostfix }}
        </q-btn>
      </template>
    </q-select>

    <CrudModal
      :title="titlePostfix"
      :opened="openedModal"
      :create-gql="modalCreateGql"
      :extend-create-params="modalParams"
      @close="openedModal = false"
      @finished="refetchItems"
      @on-create-new="onCreateNew"
    />
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  toRefs,
  watch
} from 'vue';

import CrudModal from 'src/components/Dialogs/CrudModal.vue'

export default defineComponent({
  name: 'BulkUpdateStep2',
  components: {
    CrudModal,
  },
  props: {
    modelValue: {
      type: Object,
      default: () => null
    },
    options: {
      type: Array,
      default: () => []
    },
    modalParams: {
      type: Object,
      default: () => {}
    },
    modalCreateGql: {
      type: String,
      default: null
    },
    titlePostfix: {
      type: String,
      default: null
    },
  },
  emits: ['on-refetch', 'on-create-new'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props);

    const selectedOption = ref(modelValue.value);
    const openedModal = ref(false);

    function refetchItems() {
      emit('on-refetch')
    }

    function onCreateNew(payload) {
      emit('on-create-new', payload)
    }

    function setSelectedOption(val) {
      selectedOption.value = val;
    }

    watch(modelValue, (newVal) => {
      selectedOption.value = newVal;
    })

    return {
      selectedOption,
      openedModal,
      refetchItems,
      setSelectedOption,
      onCreateNew
    }
  }
})
</script>
