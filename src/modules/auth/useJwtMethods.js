import {
  AUTH,
  REGISTER,
  REFRESH_TOKEN,
  REVOKE_TOKEN,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  TELEGRAM_AUTH
} from 'src/graphql/types'
import { AUTH_ROUTE } from 'src/router/routes'
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

  async function telegramAuth() {
    try {
      const initData = window?.Telegram?.WebApp?.initData;
      const { data } = await apolloClient.mutate({
        mutation: TELEGRAM_AUTH,
        variables: { initData }
      })
      setTokens(data?.telegramAuth?.jwt, data?.telegramAuth?.refresh)
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
      if (token || token.length) {
        await apolloClient.mutate({
          mutation: REVOKE_TOKEN,
          variables: { token }
        })
      }  
    } finally {
      clear()
    }
  }

  async function logout() {
    const isAuthPage = window.location.hash.includes(AUTH_ROUTE)
    if (!isAuthPage) {
      window.location.hash = AUTH_ROUTE
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
