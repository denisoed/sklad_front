<template>
  <q-btn
    round
    size="md"
    color="grey"
    push
    @click="onClick"
  >
    <q-icon
      name="mdi-arrow-left"
    />
  </q-btn>
</template>

<script>
import {
  defineComponent,
  toRefs,
} from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'BtnBack',
  props: {
    link: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const { link } = toRefs(props)
    const { back, push } = useRouter()

    function onClick() {
      if (link.value) {
        push(link.value)
      } else {
        back()
      }
    }

    return {
      onClick,
    }
  }
})
</script>
