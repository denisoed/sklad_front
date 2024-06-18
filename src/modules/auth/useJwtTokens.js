import {
  TOKEN_ACCESS_NAME,
  TOKEN_REFRESH_NAME,
  TOKEN_TYPE,
} from 'src/config'

const useJwtTokens = () => {
  function isAuthenticated() {
    return getAccessToken() !== null
  }

  function getAuthenticationBearer() {
    const token = getAccessToken()
    return token ? `${TOKEN_TYPE} ${token}` : ''
  }

  function setAccessToken(accessToken) {
    localStorage.setItem(TOKEN_ACCESS_NAME, accessToken)
  }

  function setRefreshToken(refreshToken) {
    localStorage.setItem(TOKEN_REFRESH_NAME, refreshToken)
  }

  function setTokens(accessToken, refreshToken) {
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    return { accessToken, refreshToken }
  }

  function getAccessToken() {
    return localStorage.getItem(TOKEN_ACCESS_NAME) || ''
  }

  function getRefreshToken() {
    return localStorage.getItem(TOKEN_REFRESH_NAME) || ''
  }

  function clear() {
    localStorage.removeItem(TOKEN_ACCESS_NAME)
    localStorage.removeItem(TOKEN_REFRESH_NAME)
  }

  return {
    isAuthenticated,
    getAuthenticationBearer,
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
    setTokens,
    clear,
  }
}

export default useJwtTokens
