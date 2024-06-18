import gql from 'graphql-tag';

export const LIST_HISTORIES = gql`
  query ListHistories($where: JSON,  $sort: String) {
    listHistories(where: $where, sort: $sort) {
      action
      json
      created_at
      sklad {
        name
      }
      product {
        id
      }
      users_permissions_user {
        fullname
        email
      }
    }
  }
`

export const CREATE_HISTORY = gql`
  mutation CreateHistory($data: HistoryInput!) {
    createHistory(input: { data: $data }) {
      history {
        action
        json
      }
    }
  }
`
