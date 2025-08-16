import { useQuasar } from 'quasar'
import { ref, computed } from 'vue'
import { SIZES, DELETE_SIZES } from 'src/graphql/sizes'
import { apolloClient } from 'src/boot/apollo'
import useHelpers from 'src/modules/useHelpers'
import { useSizesStore } from 'src/stores/sizes'
import { useMutation } from '@vue/apollo-composable'
import { useI18n } from 'vue-i18n'

const useSizes = () => {
  const { t: $t } = useI18n()
  const {
    mutate: deleteSizes,
    loading: deleteSizesLoading,
    error: deleteSizesError,
  } = useMutation(DELETE_SIZES)

  const $q = useQuasar()
  const { showError, showSuccess } = useHelpers()
  const sizesStore = useSizesStore()

  const sizes = computed(() => sizesStore.getSizes)

  const isLoading = ref(false)

  async function fetchSizes(skladsIds = []) {
    if (!skladsIds?.length) return
    try {
      isLoading.value = true;
      const { data } = await apolloClient.query({
        query: SIZES,
        variables: { where: { sklads: skladsIds }},
        fetchPolicy: 'network-only'
      })
      sizesStore.setSizes(data?.sizes)
    } catch (error) {
      console.error(error);
      showError($t('common.unknownError') + '. ' + $t('common.reloadApp'))
    } finally {
      isLoading.value = false;
    }
  }

  function removeSizes(size) {
    $q.dialog({
      title: `${$t('common.delete')} "${size.name}"?`,
      message: $t('mainSettings.sizesTab.deleteConfirm'),
      cancel: true,
      persistent: true,
      ok: {
        color: 'deep-orange',
        label: $t('common.delete'),
        push: true
      },
      cancel: {
        color: 'grey',
        textColor: 'white',
        label: $t('common.cancel'),
        push: true
      }
    }).onOk(async () => {
      await deleteSizes({ id: size.id })
      if (!deleteSizesError.value) {
        fetchSizes()
        // NOTE: add to history
        showSuccess($t('sizes.deletedSuccessfully'))
      } else {
        showError($t('common.error') + '. ' + $t('common.tryLater'))
      }
    })
  }

  return {
    fetchSizes,
    sizes,
    isLoading,
    deleteSizesLoading,
    removeSizes
  }
}

export default useSizes
