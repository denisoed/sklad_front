import { InMemoryCache, from, fromPromise } from '@apollo/client/core'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'
import { createUploadLink } from 'apollo-upload-client'
import useJwtTokens from 'src/modules/auth/useJwtTokens'
import useJwtMethods from 'src/modules/auth/useJwtMethods'

const {
  getAuthenticationBearer,
  clear,
  getAccessToken,
  getRefreshToken
} = useJwtTokens()
const {
  refreshToken,
  logout
} = useJwtMethods()

let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = () => {
  pendingRequests.map(callback => callback());
  pendingRequests = [];
};

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    const aToken = getAccessToken()
    const rToken = getRefreshToken()
    if (!aToken || !rToken || aToken.length === 0 || rToken.length === 0) {
      logout()
      return
    }
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        switch (err.message) {
          case 'User Not Found':
            logout()
            return
          case 'Invalid token.':
            let forward$;
            if (!isRefreshing) {
              isRefreshing = true;
              try {
                forward$ = fromPromise(
                  refreshToken()
                    .then(() => {
                      resolvePendingRequests(); 
                      return;
                    })
                    .catch(() => {
                      pendingRequests = [];
                      clear()
                      logout()
                      return;
                    })
                    .finally(() => {
                      isRefreshing = false;
                      window.location.reload();
                    })
                  ).filter(value => Boolean(value));
                
              } catch (error) {
                console.log('finally', error);
              }
            } else {
              forward$ = fromPromise(
                new Promise(resolve => {
                  pendingRequests.push(() => resolve());
                })
              );
            }
            return forward$.flatMap(() => forward(operation)); 
        }
      }
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
      // if you would also like to retry automatically on
      // network errors, we recommend that you use
      // apollo-link-retry
    }
  }
);

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    Authorization: getAuthenticationBearer(),
  },
}))

const httpLink = createUploadLink({
  uri: process.env.GRAPHQL_URI,
})

export /* async */ function getDefaultOptions(/* {app, router, ...} */ options) {
  return {
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  }
}

export /* async */ function getAuthOptions(/* {app, router, ...} */ options) {
  return {
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
  }
}
