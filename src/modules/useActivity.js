import { computed } from 'vue'
import { apolloClient } from 'src/boot/apollo'
import moment from 'moment'
import { DISPLAY_FORMAT } from 'src/config'
import {
  LIST_ACTIVITIES,
  CREATE_ACTIVITY,
} from 'src/graphql/activity'
import { useActivitiesStore } from 'src/stores/activities'

const useActivity = () => {
  const activitiesStore = useActivitiesStore()

  const listActivities = computed(() => {
    const activities = activitiesStore.getListActivities || []
    return activities.map(a => ({
      ...a,
      created_at: moment(a.created_at).local().format(DISPLAY_FORMAT)
    }));
  })
  const loadingActivities = computed(() => activitiesStore.isLoading)

  async function fetchActivities(where) {
    try {
      activitiesStore.setLoadingActivities(true)
      const { data } = await apolloClient.query({
        query: LIST_ACTIVITIES,
        variables: {
          where,
          sort: 'created_at:desc',
        },
        fetchPolicy: 'network-only'
      })
      activitiesStore.setListActivities(data?.listActivities)
      return data?.listActivities
    } catch (error) {
      console.error(error)
    } finally {
      activitiesStore.setLoadingActivities(false)
    }
  }

  async function createActivity(payload) {
    try {
      activitiesStore.setLoadingActivities(true)
      const { data } = await apolloClient.mutate({
        mutation: CREATE_ACTIVITY,
        variables: { data: payload }
      })
      return data?.createActivity
    } catch (error) {
      console.error(error)
    } finally {
      activitiesStore.setLoadingActivities(false)
    }
  }

  return {
    createActivity,
    fetchActivities,
    listActivities,
    loadingActivities,
  }
}

export default useActivity
