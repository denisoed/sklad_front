import {
  AUTH,
  REGISTER,
  REFRESH_TOKEN,
  REVOKE_TOKEN,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  TELEGRAM_AUTH
} from 'src/graphql/types'
import { START_ROUTE } from 'src/router/routes'
import { apolloClient, authClient } from 'src/boot/apollo'
import useJwtTokens from 'src/modules/auth/useJwtTokens'
import { api } from 'boot/axios'

const useJwtMethods = () => {
  const {
    setTokens,
    getRefreshToken,
    clear,
  } = useJwtTokens()

  async function connect(url) {
    if (!url) throw 'URL is missing'
    try {
      const { data, status, statusText } = await api.get(url)
      if (status !== 200) {
        throw statusText
      } else {
        setTokens(data?.jwt, data?.refresh)
      }
    } catch (error) {
      throw error
    }
  }

  async function login(email, password) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: AUTH,
        variables: { email, password }
      })
      setTokens(data?.auth?.jwt, data?.auth?.refresh)
    } catch (error) {
      throw error
    }
  }

  async function telegramAuth(initData, mode = 'tg') {
    try {
      const { data } = await apolloClient.mutate({
        mutation: TELEGRAM_AUTH,
        variables: { initData, mode }
      })
      setTokens(data?.telegramAuth?.jwt, data?.telegramAuth?.refresh)
      return data
    } catch (error) {
      throw error
    }
  }

  async function forgotPassword(email) {
    await apolloClient.mutate({
      mutation: FORGOT_PASSWORD,
      variables: { email }
    })
  }

  async function register(username, email, password) {
    const { data } = await apolloClient.mutate({
      mutation: REGISTER,
      variables: { username, email, password }
    })
    return data?.register
  }

  async function resetPassword(code, password, passwordConfirmation) {
    await apolloClient.mutate({
      mutation: RESET_PASSWORD,
      variables: {
        code,
        password,
        passwordConfirmation
      }
    })
  }
  
  async function refreshToken() {
    const token = getRefreshToken()
    const { data } = await authClient.mutate({
      mutation: REFRESH_TOKEN,
      variables: { token }
    })
    return setTokens(data?.refreshToken?.jwt, data?.refreshToken?.refresh)
  }

  async function revokeToken() {
    try {
      const token = getRefreshToken()
      if (token && token.length > 0) {
        await apolloClient.mutate({
          mutation: REVOKE_TOKEN,
          variables: { token }
        })
      }  
    } catch (error) {
      console.error('Error revoking token:', error)
    } finally {
      clear()
    }
  }

  async function logout() {
    const isAuthPage = window.location.hash.includes(START_ROUTE)
    if (!isAuthPage) {
      // Use router.push if available, otherwise fallback to hash
      try {
        const router = window.$router || window.router
        if (router && router.push) {
          router.push(START_ROUTE)
        } else {
          window.location.hash = START_ROUTE
        }
      } catch {
        window.location.hash = START_ROUTE
      }
    }
  }

  return {
    login,
    register,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    revokeToken,
    connect,
    telegramAuth
  }
}

export default useJwtMethods
