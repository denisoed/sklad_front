import moment from 'moment'
import { ME, USER, UPDATE_USER } from 'src/graphql/types'
import { apolloClient } from 'src/boot/apollo'
import { useProfileStore } from 'src/stores/profile'
import { computed } from 'vue'
import { ROLE_ADMIN, DISPLAY_FORMAT } from 'src/config'

const useProfile = () => {
  const profileStore = useProfileStore()
  const profile = computed(() => profileStore.getProfile)
  const isAdmin = computed(() => profile.value?.role?.type === ROLE_ADMIN)
  const subscrExpiredAt = computed(() => moment(profile.value?.expiredAt).format(DISPLAY_FORMAT))
  const subscrHasExpired = computed(() => moment(profile.value?.expiredAt).isBefore(moment()))

  async function fetchProfile() {
    const { data } = await apolloClient.query({
      query: ME,
      fetchPolicy: 'network-only'
    })
    const user = await apolloClient.query({
      query: USER,
      variables: { id: data.me.id },
      fetchPolicy: 'network-only'
    })
    profileStore.setProfile(user.data?.user)
  }

  async function updateUser(id, data) {
    await apolloClient.mutate({
      mutation: UPDATE_USER,
      variables: {
        where: { id },
        data,
      }
    })
  }

  return {
    fetchProfile,
    profile,
    isAdmin,
    updateUser,
    subscrExpiredAt,
    subscrHasExpired
  }
}

export default useProfile
