import gql from 'graphql-tag';

export const LIST_HISTORIES = gql`
  query ListHistories($where: JSON,  $sort: String, $limit: Int, $start: Int) {
    listHistories(where: $where, sort: $sort, limit: $limit, start: $start) {
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
        telegramId
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
