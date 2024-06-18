import { useQuasar } from 'quasar'
import { ref, computed } from 'vue'
import { SIZES, DELETE_SIZES } from 'src/graphql/sizes'
import { apolloClient } from 'src/boot/apollo'
import useHelpers from 'src/modules/useHelpers'
import useProfile from 'src/modules/useProfile'
import { useSizesStore } from 'src/stores/sizes'
import { useMutation } from '@vue/apollo-composable'

const useSizes = () => {
  const {
    mutate: deleteSizes,
    loading: deleteSizesLoading,
    error: deleteSizesError,
  } = useMutation(DELETE_SIZES)

  const $q = useQuasar()
  const { showError, showSuccess } = useHelpers()
  const sizesStore = useSizesStore()
  const { profile } = useProfile()

  const sizes = computed(() => sizesStore.getSizes)

  const isLoading = ref(false)

  async function fetchSizes() {
    try {
      isLoading.value = true;
      const { data } = await apolloClient.query({
        query: SIZES,
        variables: { where: { users_permissions_users: profile.value.id }},
        fetchPolicy: 'network-only'
      })
      sizesStore.setSizes(data?.sizes)
    } catch (error) {
      showError('Ошибка при отправке запроса на сервер!')
    } finally {
      isLoading.value = false;
    }
  }

  function removeSizes(size) {
    $q.dialog({
      title: `Удалить "${size.name}"?`,
      message: 'Вы уверены, что хотите удалить эти размеры?',
      cancel: true,
      persistent: true,
      ok: {
        color: 'deep-orange',
        label: 'Удалить',
        push: true
      },
      cancel: {
        color: 'white',
        textColor: 'black',
        label: 'Отмена',
        push: true
      }
    }).onOk(async () => {
      await deleteSizes({ id: size.id })
      if (!deleteSizesError.value) {
        fetchSizes()
        // NOTE: add to history
        showSuccess('Размеры успешно удалены!')
      } else {
        showError('Произошла ошибка. Попробуйте позже.')
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
