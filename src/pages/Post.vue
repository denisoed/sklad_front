<template>
  <q-page>
    <div class="container flex column items-start q-gap-md">
      <div class="flex items-center q-gap-md justify-between full-width">
        <q-btn
          round
          size="md"
          color="grey"
          push
          to="/"
          v-vibrate
          >
          <q-icon name="mdi-arrow-left" />
        </q-btn>
        <div class="updated-at">Обновлено: {{ updatedAt }}</div>
      </div>
      <h1 class="q-my-none">{{ postResult?.title }}</h1>
      <VMarkdownView
        :content="postResult?.text"
      />
    </div>
  </q-page>
</template>

<script>
import moment from 'moment'
import { defineComponent, ref, onBeforeMount } from 'vue'
import { VMarkdownView } from 'vue3-markdown'
import 'vue3-markdown/dist/style.css'
import usePosts from 'src/modules/usePosts'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import 'moment/locale/ru'

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

    const updatedAt = computed(() => moment(postResult.value?.updated_at).format('DD MMMM YYYY'))

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
      postResult,
      updatedAt
    }
  }
})
</script>

<style lang="scss" scoped>
.markdown-body {
  background-color: var(--main-bg);
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
