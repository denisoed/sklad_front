<template>
  <div class="dialogs">
    <ManageSkladDialog />
    <ManageCategoryDialog />
    <ManageCostDialog />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const ManageSkladDialog = defineAsyncComponent(
  () => import('src/components/Dialogs/ManageSkladDialog.vue')
)
const ManageCategoryDialog = defineAsyncComponent(
  () => import('src/components/Dialogs/ManageCategoryDialog.vue')
)
const ManageCostDialog = defineAsyncComponent(
  () => import('src/components/Dialogs/ManageCostDialog.vue')
)
</script>
