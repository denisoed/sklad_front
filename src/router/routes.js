import {
  READ_HISTORY,
  READ_SETTINGS,
  READ_COST,
  READ_PRODUCTS_WITH_MIN_SIZES,
  READ_STATISTIC,
  CAN_ADD_PRODUCT
} from 'src/permissions'

export const HOME_ROUTE = '/'
export const MAIN_SETTINGS_ROUTE = '/main-settings'
export const BUCKET_ROUTE = '/bucket'
export const PRODUCTS_ROUTE = '/products'
export const STATISTIC_ROUTE = '/statistic'

export const HEADER_ROUTES = [
  { path: HOME_ROUTE, component: () => import('pages/IndexPage.vue') },
]

export const MAIN_ROUTES = [
  { path: MAIN_SETTINGS_ROUTE, component: () => import('pages/MainSettings.vue') },
  { path: BUCKET_ROUTE, component: () => import('pages/BucketPage.vue') },
  { path: PRODUCTS_ROUTE, component: () => import('pages/Products.vue') },
  { path: STATISTIC_ROUTE, component: () => import('pages/Statistic.vue') },
  { path: '/product/:productId', component: () => import('pages/ProductPage.vue') },
  {
    path: '/create-product',
    component: () => import('pages/ProductPage.vue'),
  },
]

export const SKLAD_ROUTES = [
  { path: '/sklad/:skladId', component: () => import('src/pages/SkladPage.vue') },
  { path: '/sklad/:skladId/categories', component: () => import('pages/Categories.vue') },
  { path: '/sklad/:skladId/categories/:categoryId', component: () => import('pages/Products.vue') },
  { path: '/sklad/:skladId/product/:productId', component: () => import('pages/ProductPage.vue') },
  { path: '/sklad/:skladId/bucket', component: () => import('pages/BucketPage.vue') },
  {
    path: '/sklad/:skladId/create-product',
    component: () => import('pages/ProductPage.vue'),
    meta: {
      permissions: [CAN_ADD_PRODUCT]
    }
  },
  {
    path: '/sklad/:skladId/history',
    component: () => import('pages/History.vue'),
    meta: {
      permissions: [READ_HISTORY]
    }
  },
  {
    path: '/sklad/:skladId/history/:productId',
    component: () => import('pages/History.vue'),
    meta: {
      permissions: [READ_HISTORY]
    }
  },
  {
    path: '/sklad/:skladId/costs',
    component: () => import('pages/Costs.vue'),
    meta: {
      permissions: [READ_COST]
    }
  },
  {
    path: '/sklad/:skladId/settings',
    component: () => import('pages/Settings.vue'),
    meta: {
      permissions: [READ_SETTINGS]
    }
  },
  {
    path: '/sklad/:skladId/PriceLabelEditor/:priceLabelId',
    component: () => import('pages/PriceLabelEditor.vue')
  },
  {
    path: '/sklad/:skladId/statistic',
    component: () => import('pages/Statistic.vue'),
    meta: {
      permissions: [READ_STATISTIC]
    }
  },
  {
    path: '/sklad/:skladId/products-with-min-sizes',
    component: () => import('pages/ProductsWithMinSizes.vue'),
    meta: {
      permissions: [READ_PRODUCTS_WITH_MIN_SIZES]
    }
  },
]

export const START_ROUTE = '/start'
export const AUTH_ROUTE = '/auth'
export const REG_ROUTE = '/register'
export const FORGOT_ROUTE = '/forgot-password'
export const RESET_PASSWORD_ROUTE = '/reset-password'
export const CONFIRM_ROUTE = '/confirm'
export const CONFIRM_REG_ROUTE = '/confirm-register'
export const ONBOARD_ROUTE = '/onboard'
export const BLOCKED_ROUTE = '/blocked'
export const CONNECT_GOOGLE_ROUTE = '/connect/google'
export const POST_ROUTE = '/post/:postId'
export const POSTS_ROUTE = '/posts'

export const AUTH_ROUTES = [
  { path: START_ROUTE, component: () => import('pages/Start.vue') },
  { path: AUTH_ROUTE, component: () => import('pages/Auth.vue') },
  { path: REG_ROUTE, component: () => import('pages/Register.vue') },
  { path: FORGOT_ROUTE, component: () => import('pages/ForgotPassword.vue') },
  { path: RESET_PASSWORD_ROUTE, component: () => import('pages/ResetPassword.vue') },
  { path: CONFIRM_ROUTE, component: () => import('pages/Confirm.vue') },
  { path: CONFIRM_REG_ROUTE, component: () => import('pages/ConfirmReg.vue') },
  { path: BLOCKED_ROUTE, component: () => import('pages/Blocked.vue') },
  { path: CONNECT_GOOGLE_ROUTE, component: () => import('pages/connect/google.vue') },
  { path: ONBOARD_ROUTE, component: () => import('pages/onBoard/register.vue') },
  { path: POST_ROUTE, component: () => import('pages/Post.vue') },
  { path: POSTS_ROUTE, component: () => import('pages/Posts.vue') },
]

const routes = [
  {
    path: '/',
    component: () => import('layouts/HeaderLayout.vue'),
    children: HEADER_ROUTES
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: MAIN_ROUTES
  },
  {
    path: '/',
    component: () => import('src/layouts/SkladLayout.vue'),
    children: SKLAD_ROUTES
  },
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: AUTH_ROUTES
  },
  {
    path: '/:catchAll(.*)*',
    redirect: HOME_ROUTE
  }
]

export default routes
