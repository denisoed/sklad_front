<template>
  <div class="dialogs">
    <ManageSkladDialog />
    <ManageCategoryDialog />
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
</script>
