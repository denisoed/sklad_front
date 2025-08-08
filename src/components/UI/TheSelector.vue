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
        <div class="q-pa-md">
          <div class="text-grey-6 text-center q-mb-md">
            Список пуст
          </div>
          <q-btn
            push
            color="primary"
            class="full-width border-radius-sm"
            icon="mdi-plus"
            @click="emit('on-create-new')"
          >
            Создать {{ titlePostfix }}
          </q-btn>
        </div>
      </template>
      <template #after-options>
        <q-separator />
        <div class="flex no-wrap q-gap-md q-pa-md">
          <q-btn
            push
            color="grey-6"
            class="border-radius-sm"
            icon="mdi-close"
            v-close-popup
          />
          <q-btn
            push
            color="primary"
            class="full-width border-radius-sm"
            icon="mdi-plus"
            @click="emit('on-create-new')"
          >
            Создать {{ titlePostfix }}
          </q-btn>
        </div>
      </template>
    </q-select>
  </div>
</template>

<script setup>
import {
  ref,
  toRefs,
  watch
} from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => null
  },
  options: {
    type: Array,
    default: () => []
  },
  titlePostfix: {
    type: String,
    default: null
  },
})

const emit = defineEmits(['on-create-new'])

const { modelValue } = toRefs(props);

const selectedOption = ref(modelValue.value);

function setSelectedOption(val) {
  selectedOption.value = val;
}

watch(modelValue, (newVal) => {
  selectedOption.value = newVal;
})
</script>
