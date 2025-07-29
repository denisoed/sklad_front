import gql from 'graphql-tag';

export const UPLOAD = gql`
  mutation Upload($file: Upload!) {
    upload(file: $file) {
      id
      name
      url
    }
  }
`

export const DELETE_FILE = gql`
  mutation DeleteFile($id: ID!) {
    deleteFile(input: { where: { id: $id }}) {
      file {
        id
      }
    }
  }
`

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(input: { where: { id: $id }}) {
      product {
        image {
          id
        }
      }
    }
  }
`

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($data: ProductInput!) {
    createProduct(input: { data: $data }) {
      product {
        id
      }
    }
  }
`

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $data: editProductInput!) {
    updateProduct(input: { where: { id: $id }, data: $data }) {
      product {
        id
      }
    }
  }
`

export const GET_PRODUCT = gql`
  query Product($id: ID!) {
    product(id: $id) {
      id
      name
      category {
        id
        name
      }
      origPrice
      newPrice
      discountPrice
      discountDays
      withDiscount
      image {
        id
        url
      }
      sklad {
        id
        name
        sizes
      }
      typeSize {
        id
        list {
          size
        }
      }
      sizes {
        id
        size
      }
      color
      countSizes
      useNumberOfSizes
      prices {
        id
        name
        price
      }
    }
  }
`

export const GET_PRODUCTS = gql`
  query Products($where: JSON, $sort: String) {
    products(where: $where, sort: $sort) {
      id
      name
      origPrice
      newPrice
      image {
        id
        url
      }
      typeSize {
        list {
          size
        }
      }
      sizes {
        id
        size
      }
      sklad {
        id
        name
        sizes
      }
      discountPrice
      discountDays
      withDiscount
      color
      countSizes
      useNumberOfSizes
      category {
        id
      }
      prices {
        id
        name
        price
      }
    }
  }
`

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($q: String, $where: JSON, $sizes: [String]) {
    search(q: $q, where: $where, sizes: $sizes) {
      id
      name
      origPrice
      newPrice
      image {
        id
        url
      }
      typeSize {
        list {
          size
        }
      }
      sizes {
        id
        size
      }
      sklad {
        id
        name
        sizes
      }
      discountPrice
      discountDays
      withDiscount
      color
      countSizes
      useNumberOfSizes
      category {
        id
      }
      prices {
        name
        price
        id
      }
    }
  }
`

export const PRODUCTS_WITH_MIN_SIZES = gql`
  query ProductsWithMinSizes($where: JSON, $sort: String) {
    productsWithMinSizes(where: $where, sort: $sort) {
      id
      name
      origPrice
      newPrice
      image {
        id
        url
      }
      sizes {
        size
      }
      discountPrice
      discountDays
      withDiscount
      color
      countSizes
      useNumberOfSizes
      category {
        id
      }
      prices {
        id
        name
        price
      }
    }
  }
`

export const LIST_ACTIVITIES = gql`
  query ListActivities($where: JSON, $sort: String) {
    listActivities(where: $where, sort: $sort) {
      id
      name
      origPrice
      newPrice
      size
      discount
      percentageDiscount
      created_at
      countSizes,
      product {
        id
        sizes {
          id
          size
        }
        sklad {
          id
        }
        countSizes
      }
    }
  }
`

export const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(input: { where: { id: $id }}) {
      activity {
        id
      }
    }
  }
`

export const STATISTIC_FINANCE = gql`
  query StatisticFinance($where: JSON!) {
    statisticFinance(where: $where) {
      sumAvailableProductsWholesalePrice
      incomeFromAvailableProducts
    }
  }
`

export const STATISTIC_ACTIVITIES = gql`
  query StatisticActivities($where: JSON!) {
    statisticActivities(where: $where) {
      totalRevenue
    }
  }
`

export const ACTIVITIES = gql`
  query($where: JSON) {
    activities(where: $where) {
      name
      origPrice
      newPrice
      size
      discount
      percentageDiscount
      created_at
      countSizes
    }
  }
`

export const CREATE_ACTIVITY = gql`
  mutation CreateActivity($data: ActivityInput!) {
    createActivity(input: { data: $data }) {
      activity {
        name
        origPrice
        newPrice
        size
        discount
        percentageDiscount
        countSizes
      }
    }
  }
`

export const CREATE_COST = gql`
  mutation CreateCost($data: CostInput!) {
    createCost(input: { data: $data }) {
      cost {
        description
        sum
        created_at
      }
    }
  }
`

export const LIST_COSTS = gql`
  query ListCosts($where: JSON, $sort: String) {
    listCosts(where: $where, sort: $sort) {
      id
      description
      sum
      users_permissions_user {
        fullname
      }
      created_at
    }
  }
`

export const DELETE_COST = gql`
  mutation DeleteCost($id: ID!) {
    deleteCost(input: { where: { id: $id }}) {
      cost {
        id
      }
    }
  }
`

export const LIST_COSTS_SUM = gql`
  query($where: JSON, $sort: String) {
    listCostsSum(where: $where, sort: $sort) {
      sum
    }
  }
`

export const AUTH = gql`
  mutation Auth($email: String!, $password: String!) {
    auth(identifier: $email, password: $password) {
      jwt
      refresh
    }
  }
`

export const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(input: { username: $username, email: $email, password: $password }) {
      user {
        email
      }
    }
  }
`

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token, renew: true) {
      jwt
      refresh
    }
  }
`

export const REVOKE_TOKEN = gql`
  mutation RevokeToken($token: String!) {
    revokeToken(token: $token) {
      confirmed
    }
  }
`

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      ok
    }
  }
`

export const RESET_PASSWORD = gql`
  mutation ResetPassword($code: String!, $password: String!, $passwordConfirmation: String!) {
    resetPassword(code: $code, password: $password, passwordConfirmation: $passwordConfirmation) {
      jwt
    }
  }
`

export const ME = gql`
  query {
    me {
      id
      permissions {
        list
        sklad {
          id
        }
      }
    }
  }
`

export const TELEGRAM_AUTH = gql`
  mutation TelegramAuth($initData: String!, $mode: String!) {
    telegramAuth(initData: $initData, mode: $mode) {
      jwt
      refresh
    }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($where: InputID!, $data: editUserInput!) {
    updateUser(input: { where: $where, data: $data }) {
      user {
        id
      }
    }
  }
`

export const USERS = gql`
  query($where: JSON, $sort: String) {
    users(where: $where, sort: $sort) {
      id
      email
      fullname
      telegramId
      permissions {
        list
        sklad {
          id
        }
      }
    }
  }
`

export const USER = gql`
  query($id: ID!) {
    user(id: $id) {
      id
      email
      fullname
      role {
        type
      }
      telegramId
      expiredAt
      onboarded
      permissions {
        list
        sklad {
          id
        }
      }
    }
  }
`

// Sale products
export const ADD_PRODUCT_SIZES_TO_SALE = gql`
  mutation AddProductSizesToSale($input: AddProductSizesToSaleInput!) {
    addProductSizesToSale(input: $input) {
      id
    }
  }
`

export const UPDATE_SALE_PRODUCT = gql`
  mutation UpdateSaleProduct($id: ID!, $data: editSaleProductInput!) {
    updateSaleProduct(input: { where: { id: $id }, data: $data }) {
      saleProduct {
        id
      }
    }
  }
`

export const DELETE_SALE_PRODUCT = gql`
  mutation DeleteSaleProduct($id: ID!) {
    deleteSaleProduct(input: { where: { id: $id }}) {
      saleProduct {
        id
      }
    }
  }
`

export const SALE_PRODUCTS = gql`
  query SaleProducts($where: JSON) {
    saleProducts(where: $where) {
      id
      discount
      percentageDiscount
      countSizes
      sklad {
        id
        name
      }
      sizes {
        id
        size
      }
      payCash
      payCard
      cashSum
      cardSum
      comment
      product {
        id
        name
        origPrice
        newPrice
        discountPrice
        discountDays
        withDiscount
        sizes {
          id
          size
        }
        typeSize {
          list {
            size
          }
        }
        image {
          id
          url
        }
        color
        countSizes
        useNumberOfSizes
      }
    }
  }
`