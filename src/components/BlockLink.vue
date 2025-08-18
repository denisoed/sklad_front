<template>
  <component
    :is="as === 'link' ? 'router-link' : 'a'"
    :to="link"
    class="flex q-gap-sm no-wrap justify-between flex-center block-link block-bg q-pa-md"
    :style="[accentColor && `border-bottom: 5px solid ${accentColor}`]"
    v-ripple
  >
    <div class="flex column items-start">
      <span class="text-left">
        {{ title }}
      </span>
      <p class="text-left q-mb-none">{{ caption }}</p>
    </div>
    <q-icon
      :name="icon"
      color="grey"
    />
    <slot />
  </component>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BlockLink',
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: '#'
    },

    icon: {
      type: String,
      default: ''
    },
    as: {
      type: String,
      default: 'link'
    },
    accentColor: {
      type: String,
      default: null
    },
  }
})
</script>

<style lang="scss" scoped>
.block-link {
    position: relative;
    height: 100px;
    min-height: 100px;
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius-sm);
    text-decoration: none;
    cursor: pointer;
    flex: 1;

    .q-icon {
      color: var(--text-description);
      font-size: 26px;
    }

    span {
      color: var(--text-title);
      font-size: 15px;
      line-height: 20px;
    }

    p {
      color: var(--text-description);
      opacity: 0.8;
      line-height: normal;
    }
  }
</style>