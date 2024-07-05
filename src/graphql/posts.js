import gql from 'graphql-tag';

export const POST = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id
      title
      text
      updated_at
    }
  }
`

export const POSTS = gql`
  query Posts {
    posts {
      id
      title
      text
      description
      updated_at
      banner {
        url
      }
    }
  }
`
