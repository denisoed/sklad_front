import gql from 'graphql-tag';

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

export const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(input: { where: { id: $id }}) {
      activity {
        id
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
          name
        }
        countSizes
      }
    }
  }
`
