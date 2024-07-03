import gql from 'graphql-tag';

export const POST = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id
      title
      text
    }
  }
`
