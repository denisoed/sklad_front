import gql from 'graphql-tag';

export const PRINT_TEMPLATES = gql`
  query PrintTemplates($where: JSON) {
    printTemplates(where: $where) {
      id
      type
      name
      width
      height
    }
  }
`
export const PRINT_TEMPLATE = gql`
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

export const CREATE_PRINT_TEMPLATE = gql`
  mutation CreatePrintTemplate($data: PrintTemplateInput!) {
    createPrintTemplate(input: { data: $data }) {
      printTemplate {
        id
      }
    }
  }
`

export const UPDATE_PRINT_TEMPLATE = gql`
  mutation UpdateCategory($id: ID!, $data: editCategoryInput!) {
    updateCategory(input: { where: { id: $id }, data: $data }) {
      category {
        id
      }
    }
  }
`

export const DELETE_PRINT_TEMPLATE = gql`
  mutation DeletePrintTemplate($id: ID!) {
    deletePrintTemplate(input: { where: { id: $id }}) {
      printTemplate {
        id
      }
    }
  }
`
