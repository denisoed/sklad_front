<template>
  <div class="flex column q-gap-md">
    <q-separator />
    <div class="flex column q-gap-md">
      <!-- Sklads -->
      <Selector
        v-model="product.sklad"
        title-postfix="склад"
        :modal-params="{ users: profile?.id }"
        :modal-create-gql="CREATE_SKLAD"
        :options="skladsOptions"
        @on-create-new="onCreateNew"
        @on-refetch="refetchSklads"
        outlined
        label="Склад"
        tabindex="1"
        clearable
      />

      <!-- Name -->
      <q-input
        v-model="product.name"
        outlined
        label="Название товара"
        tabindex="4"
        class="full-width"
        data-scroller="name"
        enterkeyhint="done"
      />

      <!-- Categories -->
      <Selector
        v-if="product.sklad"
        v-model="product.category"
        title-postfix="категорию"
        :modal-params="{ sklad: product.sklad }"
        :modal-create-gql="CREATE_CATEGORY"
        :options="categoriesOptions"
        @on-refetch="refetchCategories"
        outlined
        label="Категория товара"
        tabindex="2"
        clearable
      />

      <div v-permissions="[READ_ORIGINAL_PRICE]" class="col-12">
        <InputPrice
          v-model="product.origPrice"
          label="Оптовая цена за 1 шт"
          clear
          tabindex="3"
        />
      </div>
      <div class="col-12">
        <InputPrice
          v-model="product.newPrice"
          label="Розничная цена за 1 шт"
          clear
          tabindex="4"
        />
      </div>
    </div>
    <q-separator />
    <div class="flex no-wrap sjustify-end q-gap-md">
      <q-btn
        style="width:100%;height:40px;"
        color="grey"
        icon="mdi-arrow-left"
        push
        @click="prev"
      />
      <q-btn
        style="width:100%;height:40px;"
        color="primary"
        icon="mdi-check"
        push
        :loading="loading"
        :disable="isDisabled || loading"
        @click="submit"
      />
    </div>
  </div>
</template>

<script setup>
import {
  reactive,
  computed,
  watch
} from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import {
  CATEGORIES,
  CREATE_CATEGORY
} from 'src/graphql/category';
import {
  CREATE_SKLAD
} from 'src/graphql/sklads';
import {
  READ_ORIGINAL_PRICE,
} from 'src/permissions';
import useSklads from 'src/modules/useSklads';
import useProfile from 'src/modules/useProfile';

import Selector from 'src/components/UI/TheSelector.vue';
import InputPrice from 'src/components/InputPrice.vue';

defineOptions({
  name: 'StepTwo',
})

const emit = defineEmits(['on-prev', 'on-submit'])

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const {
  refetch: refetchCategories,
  result: categoriesResult,
  load: loadCategories
} = useLazyQuery(CATEGORIES)
const { sklads, fetchSklads, onCreateNew } = useSklads();
const { profile } = useProfile();

const product = reactive({
  sklad: null,
  name: null,
  category: null,
  origPrice: null,
  newPrice: null,
})

const isDisabled = computed(() => Object.values(product).every(p => !p))

const categoriesOptions = computed(() => {
  return categoriesResult.value?.categories.map(c => ({
    label: c.name,
    value: c.id
  }))
})

const skladsOptions = computed(() => {
  return sklads.value?.map(c => ({
    label: c.name,
    value: c.id
  }))
})

function submit() {
  const result = Object.entries(product).reduce(
    (acc, [k, v]) => v ? { ...acc, [k]: v } : acc, {}
  )
  emit('on-submit', result)
}

function prev() {
  emit('on-prev')
}

function refetchSklads() {
  fetchSklads(profile.value.id)
}

watch(product, () => {
  if (product.sklad) {
    loadCategories(
      null,
      { where: { sklad: product.sklad.value } },
      { fetchPolicy: 'network-only' }
    )
  }
});
</script>
