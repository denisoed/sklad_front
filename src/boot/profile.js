import { boot } from 'quasar/wrappers'
import { useProfileStore } from 'src/stores/profile'
import { apolloClient } from 'src/boot/apollo'
import { ME, USER } from 'src/graphql/types'
import { AUTH_ROUTES } from 'src/router/routes'
import useJwtMethods from 'src/modules/auth/useJwtMethods'

export default boot(async () => {
  const profileStore = useProfileStore()
  const isAuthPage = AUTH_ROUTES.some(r => window.location.hash.includes(r.path))
  if (!isAuthPage) {
    const { logout } = useJwtMethods()
    try {
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
    } catch {
      logout()
    }
  }
})
