<template>
  <ProductForm :is-edit="false" />
</template>

<script setup>
import ProductForm from 'src/components/Product/ProductForm.vue';
import useProductDuplication from 'src/modules/useProductDuplication';
import { onUnmounted } from 'vue';

const { clearDuplicateData } = useProductDuplication();

onUnmounted(() => {
  clearDuplicateData();
})
</script>
