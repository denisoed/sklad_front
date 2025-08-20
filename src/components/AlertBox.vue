<template>
  <div v-if="!isDismissed" class="alert-box q-mb-md q-px-md q-py-sm border-radius-sm relative-position">
    <div class="flex items-center justify-between">
      <p class="q-mb-none text-warning text-subtitle2">{{ text }}</p>
      <q-btn
        round
        dense
        icon="close"
        text-color="warning"
        size="sm"
        @click="dismissAlert"
        class="absolute-top-right"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'AlertBox',
  props: {
    text: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const isDismissed = ref(false)

    const dismissAlert = () => {
      isDismissed.value = true
      localStorage.setItem(`alert-dismissed-${props.id}`, 'true')
    }

    onMounted(() => {
      // Check if alert was previously dismissed
      const dismissed = localStorage.getItem(`alert-dismissed-${props.id}`)
      if (dismissed === 'true') {
        isDismissed.value = true
      }
    })

    return {
      isDismissed,
      dismissAlert
    }
  }
}
</script>

<style lang="scss" scoped>
.alert-box {
  background-color: rgba(255, 193, 7, 0.1);
  
  .q-btn {
    background-color: rgba(255, 193, 7, 0.1);
    top: -10px;
    right: -10px;
  }
}
</style>
