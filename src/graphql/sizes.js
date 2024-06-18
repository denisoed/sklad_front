import gql from 'graphql-tag';

export const SIZES = gql`
  query Sizes($where: JSON) {
    sizes(where: $where) {
      id
      name
      list {
        size
        type
      }
    }
  }
`

export const CREATE_SIZES = gql`
  mutation CreateSize($data: SizeInput!) {
    createSize(input: { data: $data }) {
      size {
        id
      }
    }
  }
`

export const UPDATE_SIZES = gql`
  mutation UpdateSize($id: ID!, $data: editSizeInput!) {
    updateSize(input: { where: { id: $id }, data: $data }) {
      size {
        id
      }
    }
  }
`

export const DELETE_SIZES = gql`
  mutation DeleteSize($id: ID!) {
    deleteSize(input: { where: { id: $id }}) {
      size {
        id
      }
    }
  }
`
