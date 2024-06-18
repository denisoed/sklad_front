import moment from 'moment'
import { useProfileStore } from 'src/stores/profile'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { DAY, FILTER_FORMAT } from 'src/config'
import { CREATE_COST, LIST_COSTS, DELETE_COST } from 'src/graphql/types'
import { useMutation, useLazyQuery } from '@vue/apollo-composable'

const useCosts = () => {
  const { params } = useRoute()
  const profileStore = useProfileStore()
  const userId = computed(() => profileStore.getProfile?.id)

  const {
    mutate: create,
    error: errorCost,
    loading: loadingCost
  } = useMutation(CREATE_COST)

  const {
    mutate: deleteC,
    loading: deleteLoading,
    error: deleteError,
  } = useMutation(DELETE_COST)

  const {
    load: costsLoad,
    refetch: costsRefetch,
    result: costsResult,
    loading: costsLoading
  } = useLazyQuery(LIST_COSTS)

  async function createCost(description, sum) {
    await create({
      data: {
        description,
        sum,
        sklad: params?.skladId,
        users_permissions_user: userId.value
      }
    })
  }

  async function deleteCost(id) {
    await deleteC({ id })
  }

  function loadCosts(args) {
    const newParams = args || { dates: [moment().startOf(DAY).format(FILTER_FORMAT)] }
    costsLoad(
      null,
      {
        where: {
          sklad: params?.skladId,
          ...newParams,
        },
        sort: 'created_at:desc',
      },
      { fetchPolicy: 'network-only' }
    )
  }

  return {
    createCost,
    errorCost,
    loadingCost,
    loadCosts,
    costsRefetch,
    costsResult,
    costsLoading,
    deleteCost,
    deleteError,
    deleteLoading
  }
}

export default useCosts
