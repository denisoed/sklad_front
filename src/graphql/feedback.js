import gql from 'graphql-tag';

export const CREATE_FEEDBACK = gql`
  mutation CreateFeedback($data: FeedbackInput!) {
    createFeedback(input: { data: $data }) {
      feedback {
        id
      }
    }
  }
`
