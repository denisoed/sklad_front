import { computed } from 'vue'
import { POST } from 'src/graphql/posts'
import { useLazyQuery } from '@vue/apollo-composable'

const usePosts = () => {
  const {
    result,
    load: loadPost,
    loading: loadingPost,
    refetch: refetchPost,
    error: errorPost
  } = useLazyQuery(POST)

  const postResult = computed(() => result.value?.post)

  return {
    loadPost,
    postResult,
    loadingPost,
    refetchPost,
    errorPost
  }
}

export default usePosts
