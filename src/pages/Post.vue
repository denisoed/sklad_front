<template>
  <q-page>
    <div class="container flex column items-start q-gap-md">
      <div class="flex items-center q-gap-md justify-between full-width">
        <q-btn
          round
          size="md"
          color="grey"
          push
          to="/posts"
        >
          <q-icon name="mdi-arrow-left" />
        </q-btn>
        <div class="updated-at">Обновлено: {{ postResult?.updated_at }}</div>
      </div>
      <h1 class="q-my-none">{{ postResult?.title }}</h1>
      <VMarkdownView
        :content="postResult?.text"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent, onBeforeMount } from 'vue'
import { VMarkdownView } from 'vue3-markdown'
import 'vue3-markdown/dist/style.css'
import usePosts from 'src/modules/usePosts'
import { useRoute } from 'vue-router'
import 'moment/locale/ru'

export default defineComponent({
  name: 'PostPage',
  components: {
    VMarkdownView,
  },
  setup() {
    const { loadPost, postResult } = usePosts()

    const route = useRoute()

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
      postResult
    }
  }
})
</script>

<style lang="scss" scoped>
.markdown-body {
  background-color: transparent;
  color: var(--text-black);
}

.updated-at {
  color: #9e9e9e;
  font-size: 16px;
}

h1 {
  font-size: 28px;
  line-height: normal;
  margin: 0;
  font-weight: bold;
}
</style>
