<template>
  <div class="flex column q-gap-md">
    <q-separator />
    <div class="flex column q-gap-md">
      <!-- Sklads -->
      <TheSelector
        v-model="product.sklad"
        :title-postfix="$t('common.warehouse').toLowerCase()"
        :options="skladsOptions"
        @on-create-new="onCreateNewSklad"
        outlined
        :label="$t('common.warehouse')"
        tabindex="1"
        clearable
        emit-value
        map-options
      />

      <!-- Categories -->
      <TheSelector
        v-if="product.sklad"
        v-model="product.category"
        :title-postfix="$t('common.category').toLowerCase()"
        :options="categoriesOptions"
        @on-create-new="onCreateNewCategory"
        outlined
        :label="$t('category.title')"
        tabindex="2"
        clearable
        emit-value
        map-options
      />

      <!-- Name -->
      <q-input
        v-model="product.name"
        outlined
        :label="$t('product.productName')"
        tabindex="4"
        class="full-width"
        data-scroller="name"
        enterkeyhint="done"
      />

      <div v-permissions="[READ_ORIGINAL_PRICE]" class="col-12">
        <InputPrice
          v-model="product.origPrice"
          :label="$t('product.originalPrice')"
          clear
          tabindex="3"
        />
      </div>
      <div class="col-12">
        <InputPrice
          v-model="product.newPrice"
          :label="$t('product.retailPrice')"
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
import {
  READ_ORIGINAL_PRICE,
} from 'src/permissions';
import useSklads from 'src/modules/useSklads';
import useDialog from 'src/modules/useDialog'
import TheSelector from 'src/components/UI/TheSelector.vue';
import InputPrice from 'src/components/InputPrice.vue';
import { MANAGE_CATEGORY_DIALOG, MANAGE_SKLAD_DIALOG } from 'src/config/dialogs'
import useCategories from 'src/modules/useCategories'

defineOptions({
  name: 'BulkUpdateStepTwo'
})

const emit = defineEmits(['on-prev', 'on-submit'])

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const { openDialog } = useDialog()

const { categories: categoriesResult, fetchCategories } = useCategories()
const { sklads } = useSklads();

const product = reactive({
  sklad: null,
  name: null,
  category: null,
  origPrice: null,
  newPrice: null,
})

const isDisabled = computed(() => Object.values(product).every(p => !p))

const categoriesOptions = computed(() => {
  return categoriesResult.value?.map(c => ({
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

function onCreateNewSklad() {
  openDialog(MANAGE_SKLAD_DIALOG)
}

function onCreateNewCategory() {
  openDialog(MANAGE_CATEGORY_DIALOG, {
    skladId: product.sklad.value
  })
}

watch(product, () => {
  if (product.sklad) {
    fetchCategories({ sklad: product.sklad.value })
  }
});
</script>
