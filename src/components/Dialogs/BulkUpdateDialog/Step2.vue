<template>
  <div class="flex column q-gap-md">
    <q-separator />
    <div class="flex column">
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
        class="q-mb-sm"
        label="Склад"
        tabindex="1"
        clearable
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
        class="q-mb-sm"
        label="Категория товара"
        tabindex="2"
        clearable
      />

      <div v-permissions="[READ_ORIGINAL_PRICE]" class="col-12 q-mb-md">
        <InputPrice
          v-model="product.origPrice"
          label="Оптовая цена за 1 пару"
          clear
          tabindex="3"
        />
      </div>
      <div class="col-12">
        <InputPrice
          v-model="product.newPrice"
          label="Розничная цена за 1 пару"
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
        :disable="isDisabled"
        @click="submit"
      />
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
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

import Selector from 'src/components/UI/Selector.vue';
import InputPrice from 'src/components/InputPrice.vue';

export default defineComponent({
  name: 'BulkUpdateStep2',
  components: {
    InputPrice,
    Selector,
  },
  emits: ['on-prev', 'on-submit'],
  setup(props, { emit }) {
    const {
      refetch: refetchCategories,
      result: categoriesResult,
      load: loadCategories
    } = useLazyQuery(CATEGORIES)
    const { sklads, fetchSklads, onCreateNew } = useSklads();
    const { profile } = useProfile();

    const product = reactive({
      sklad: null,
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

    return {
      prev,
      submit,
      product,
      READ_ORIGINAL_PRICE,
      categoriesOptions,
      refetchCategories,
      isDisabled,
      skladsOptions,
      refetchSklads,
      onCreateNew,
      CREATE_CATEGORY,
      CREATE_SKLAD
    }
  }
})
</script>
