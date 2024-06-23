<template>
  <div>
    <div v-if="offline" class="offline flex justify-between items-center">
      <span>{{ $t('offline') }}</span>
      <q-icon name="mdi-wifi-off" />
    </div>
    <router-view />
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'App',
  setup() {
    const offline = ref(false);

    onMounted(() => {
      window.addEventListener('online', () => {
        offline.value = false;
      });
      
      window.addEventListener('offline', () => {
        offline.value = true;
      });
    });
  }
})
</script>

<style lang="scss" scoped>
.offline {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  padding: 0 4px;
  text-align: left;
  font-size: 10px;
  color: #000;
  background: var(--q-negative);
}
</style>