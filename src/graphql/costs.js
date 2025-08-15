import gql from 'graphql-tag';

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

export const UPDATE_COST = gql`
  mutation UpdateCost($id: ID!, $data: editCostInput!) {
    updateCost(input: { where: { id: $id }, data: $data }) {
      cost {
        id
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
