import { CREATE_FEEDBACK } from 'src/graphql/feedback'
import { useMutation } from '@vue/apollo-composable'
import useProfile from 'src/modules/useProfile'

const useFeedback = () => {
  const { profile } = useProfile()

  const {
    mutate: create,
    error: errorFeedback,
    loading: loadingFeedback
  } = useMutation(CREATE_FEEDBACK)

  async function createFeedback(payload) {
    await create({
      data: {
        ...payload,
        users_permissions_user: profile.value.id
      }
    })
  }

  return {
    createFeedback,
    errorFeedback,
    loadingFeedback,
  }
}

export default useFeedback
