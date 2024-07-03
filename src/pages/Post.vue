<template>
  <div class="flex column">
    <VMarkdownView
      :mode="mode"
      :content="postResult?.text"
    ></VMarkdownView>
  </div>
</template>

<script>
import { defineComponent, ref, onBeforeMount } from 'vue'
import { VMarkdownView } from 'vue3-markdown'
import 'vue3-markdown/dist/style.css'
import usePosts from 'src/modules/usePosts'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'StartPage',
  components: {
    VMarkdownView,
  },
  setup() {
    const { loadPost, postResult } = usePosts()

    const route = useRoute()

    const content = ref('## One of the world`s most popular markdown editors')
    const mode = ref('dark')

    onBeforeMount(() => {
      loadPost(
        null,
        { id: route.params.postId },
        {
          fetchPolicy: 'network-only'
        }
      )
    })

    return {
      content,
      mode,
      postResult
    }
  }
})
</script>