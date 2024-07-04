<template>
  <q-page>
    <div class="container flex column items-start q-gap-lg">
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
        <div class="posts-title">Спискок статей</div>
      </div>
      <div class="flex column q-gap-sm">
        <router-link
          v-for="(post, i) in postsResult"
          :key="i"
          :to="post.link"
        >
          <q-card
            class="my-card"
          >
            <q-img :src="post.banner.url" />
  
            <q-card-section>
              <div class="text-h6">{{ post.title }}</div>
              <div class="q-mt-sm text-subtitle2 updated-at">Обновлено: {{ post.updated_at }}</div>
            </q-card-section>
  
            <!-- <q-card-section class="q-pt-none">
              {{ post.description }}
            </q-card-section> -->
          </q-card>
        </router-link>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, onBeforeMount } from 'vue'
import usePosts from 'src/modules/usePosts'

import 'moment/locale/ru'

export default defineComponent({
  name: 'PostsPage',
  setup() {
    const { loadPosts, postsResult } = usePosts()

    onBeforeMount(() => {
      loadPosts()
    })

    return {
      postsResult,
    }
  }
})
</script>

<style lang="scss" scoped>
.posts-title {
  color: #9e9e9e;
  font-size: 16px;
}

.updated-at {
  color: #9e9e9e;
  font-size: 16px;
}
</style>
