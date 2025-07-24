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
