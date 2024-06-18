import { reactive } from 'vue'
import { ApolloClient /*, createHttpLink */ } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { boot } from 'quasar/wrappers'
import { getDefaultOptions, getAuthOptions } from 'src/apollo'

export let apolloClient = null
export let authClient = null

export default boot(({ app }) => {
  const options = getDefaultOptions(/* {app, router ...} */)
  const authOptions = getAuthOptions(/* {app, router ...} */)
  apolloClient = new ApolloClient(options)
  authClient = new ApolloClient(authOptions)
  const apolloClients = reactive({
    default: apolloClient,
  })
  app.provide(ApolloClients, apolloClients)
})
