<template>
  <BasicDialog ref="basicDialog">
    <slot />
    <template #content>
      <div class="relative">
        <BulkPreview
          v-show="step === 1"
          @on-next="next"
          @on-remove="remove"
        />
        <Step2
          v-show="step === 2"
          @on-prev="prev"
          @on-submit="submit"
        />
        <q-inner-loading
          :showing="loading"
          label="Ожидайте..."
          color="primary"
        />
      </div>
    </template>
  </BasicDialog>
</template>

<script>
import { defineComponent, ref } from 'vue';
import BasicDialog from 'src/components/Dialogs/BasicDialog.vue';
import BulkPreview from 'src/components/Dialogs/Bulk/Preview.vue';
import Step2 from 'src/components/Dialogs/BulkUpdateDialog/Step2.vue';
import useHelpers from 'src/modules/useHelpers'
import useProduct from 'src/modules/useProduct'
import { useBulkStore } from 'src/stores/bulk'

export default defineComponent({
  name: 'BulkUpdateDialog',
  components: {
    BasicDialog,
    BulkPreview,
    Step2,
  },
  emits: ['on-finish', 'on-error'],
  setup(props, { emit }) {
    const bulkStore = useBulkStore()
    const { showSuccess, showError } = useHelpers()
    const {
      updateProductById,
    } = useProduct()

    const step = ref(1);
    const basicDialog = ref(null);
    const loading = ref(false);

    function remove() {}
    function prev() {
      step.value = 1;
    }
    function next() {
      step.value = 2;
    }

    async function submit(data) {
      try {
        loading.value = true;
        const ids = bulkStore.getBulkProducts.map(p => p.id)
        for (const id of ids) {
          await updateProductById(id, data)
        }
        showSuccess('Товары успешно обновлены!')
        emit('on-finish')
      } catch (error) {
        showError('Произошла ошибка, попробуйте позже...')
        emit('on-error')
      } finally {
        step.value = 1;
        basicDialog.value?.close()
        loading.value = false;
      }
    }

    return {
      remove,
      next,
      prev,
      step,
      submit,
      basicDialog,
      loading
    }
  }
})
</script>
