import gql from 'graphql-tag';

export const SKLADS = gql`
  query Sklads($where: JSON) {
    sklads(where: $where) {
      id
      name
      color
      order
    }
  }
`

export const SKLAD_PRODUCTS = gql`
  query SkladProducts($whereSklads: JSON, $whereCategories: JSON, $whereProducts: JSON) {
    sklads(where: $whereSklads) {
      id
      name
      color
      categories(where: $whereCategories) {
        id
        name
      }
      products(where: $whereProducts) {
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
      }
    }
  }
`

export const SKLAD_PRODUCTS_SEARCH = gql`
  query SkladProductsSearch($q: String) {
    search(q: $q) {
      id
      name
      color
      categories {
        id
        name
      }
      products {
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
      }
    }
  }
`

export const SKLAD = gql`
  query Sklad($id: ID!) {
    sklad(id: $id) {
      id
      name
      sizes
      color
      useMinSizes
      minSizes
      useNumberOfSizes
      goal
      owner {
        id
      }
      users {
        id
        fullname
        role {
          name
        }
        email
        telegramId
        permissions {
          list
          sklad {
            id
          }
        }
      }
    }
  }
`

export const CREATE_SKLAD = gql`
  mutation CreateSklad($data: SkladInput!) {
    createSklad(input: { data: $data }) {
      sklad {
        id
      }
    }
  }
`

export const UPDATE_SKLAD = gql`
  mutation UpdateSklad($id: ID!, $data: editSkladInput!) {
    updateSklad(input: { where: { id: $id }, data: $data }) {
      sklad {
        id
      }
    }
  }
`

export const REMOVE_SKLAD = gql`
  mutation RemoveSklad($skladId: ID!) {
    removeSklad(skladId: $skladId)
  }
`

export const BULK_UPDATE_SKLADS = gql`
  mutation BulkUpdateSklads($sklads: [inputBulkSklad!]) {
    bulkUpdateSklads(sklads: $sklads)
  }
`
