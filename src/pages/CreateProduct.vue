<template>
  <ProductPage :is-edit="false" />
</template>

<script setup>
import ProductPage from 'src/pages/ProductPage.vue';
import useProductDuplication from 'src/modules/useProductDuplication';
import { onUnmounted } from 'vue';

const { clearDuplicateData } = useProductDuplication();

onUnmounted(() => {
  clearDuplicateData();
})
</script>
