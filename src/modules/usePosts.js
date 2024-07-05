import { computed } from 'vue'
import { POST, POSTS } from 'src/graphql/posts'
import { useLazyQuery } from '@vue/apollo-composable'
import moment from 'moment'

const usePosts = () => {
  const {
    result: post,
    load: loadPost,
    loading: loadingPost,
    refetch: refetchPost,
    error: errorPost
  } = useLazyQuery(POST)
  const {
    result: posts,
    load: loadPosts,
    loading: loadingPosts,
    refetch: refetchPosts,
    error: errorPosts
  } = useLazyQuery(POSTS)

  const postResult = computed(() => ({
    ...post.value?.post,
    updated_at: moment(post.value?.post?.updated_at).format('DD MMMM YYYY')
  }))

  const postsResult = computed(() =>  posts.value?.posts.map(p => ({
    ...p,
    updated_at: moment(p?.updated_at).format('DD MMMM YYYY'),
    link: `/post/${p.id}`
  })))

  return {
    loadPost,
    postResult,
    loadingPost,
    refetchPost,
    errorPost,

    // Posts
    loadPosts,
    postsResult,
    loadingPosts,
    refetchPosts,
    errorPosts
  }
}

export default usePosts
