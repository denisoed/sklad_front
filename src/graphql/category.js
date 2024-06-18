import gql from 'graphql-tag';

export const CATEGORIES = gql`
  query Categories($where: JSON) {
    categories(where: $where) {
      id
      name
      color
      products {
        id
      }
    }
  }
`
export const CATEGORY = gql`
  query Category($id: ID!, $where: JSON) {
    category(id: $id) {
      id
      products(where: $where) {
        id
        name
        origPrice
        newPrice
        image {
          id
          url
        }
        sizes {
          id
          size
          type
        }
        color
      }
    }
  }
`

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($data: CategoryInput!) {
    createCategory(input: { data: $data }) {
      category {
        id
      }
    }
  }
`

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $data: editCategoryInput!) {
    updateCategory(input: { where: { id: $id }, data: $data }) {
      category {
        id
      }
    }
  }
`

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(input: { where: { id: $id }}) {
      category {
        id
      }
    }
  }
`
