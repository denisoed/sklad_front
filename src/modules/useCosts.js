import moment from 'moment'
import { useProfileStore } from 'src/stores/profile'
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import { useCostsStore } from 'src/stores/costs'
import { apolloClient } from 'src/boot/apollo'
import { DAY, FILTER_FORMAT } from 'src/config'
import { CREATE_COST, LIST_COSTS, DELETE_COST, UPDATE_COST } from 'src/graphql/costs'
import { useMutation } from '@vue/apollo-composable'

const useCosts = () => {
  const { params } = useRoute()
  const costsStore = useCostsStore()
  const profileStore = useProfileStore()

  const userId = computed(() => profileStore.getProfile?.id)
  const costsLoading = computed(() => costsStore.isLoading)
  const costs = computed(() => costsStore.getCosts)
  const costsTotal = computed(() => {
    return costs.value.reduce((prev, next) => {
      const sum = prev + next.sum
      return sum
    }, 0);
  })

  const {
    mutate: create,
    error: createError,
    loading: createLoading
  } = useMutation(CREATE_COST)

  const {
    mutate: deleteC,
    loading: deleteLoading,
    error: deleteError,
  } = useMutation(DELETE_COST)

  const {
    mutate: update,
    loading: updateLoading,
    error: updateError,
  } = useMutation(UPDATE_COST)

  async function createCost({
    description,
    sum,
    skladId,
    userId: uId
  }) {
    await create({
      data: {
        description,
        sum,
        sklad: skladId || params?.skladId,
        users_permissions_user: uId || userId.value
      }
    })
  }

  async function updateCost({
    costId,
    description,
    sum,
  }) {
    await update({ id: costId, data: { description, sum } })
  }

  async function deleteCost(id) {
    await deleteC({ id })
  }

  async function fetchCosts(args) {
    try {
      costsStore.setLoading(true)
      const newParams = args || { dates: [moment().startOf(DAY).format(FILTER_FORMAT)] }
      const { data } = await apolloClient.query({
        query: LIST_COSTS,
        variables: {
          where: {
            sklad: params?.skladId,
            ...newParams,
          },
          sort: 'created_at:desc',
        },
        fetchPolicy: 'network-only'
      })
      costsStore.setCosts(data?.listCosts || [])
    } catch (error) {
      console.error(error)
    } finally {
      costsStore.setLoading(false)
    }
  }

  return {
    createCost,
    createError,
    createLoading,
    fetchCosts,
    deleteCost,
    deleteError,
    deleteLoading,
    costs,
    costsLoading,
    updateCost,
    updateError,
    updateLoading,
    costsTotal
  }
}

export default useCosts
