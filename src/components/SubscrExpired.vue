<template>
  <div class="subscr-expired flex items-center justify-between q-pa-md">
    <span class="text-bold text-white">{{ $t('blocked.subscriptionExpired') }}</span>
    <q-btn push color="deep-orange">{{ $t('blocked.extend') }}</q-btn>
  </div>
</template>

<script>
import {
  defineComponent,
} from 'vue'

export default defineComponent({
  name: 'SubscrExpired',
})
</script>

<style lang="scss" scoped>
.subscr-expired {
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius-sm);
  background-color: rgb(255 0 0 / 20%);
  position: relative;
  overflow: hidden;

  span {
    z-index: 1;
  }

  &::before {
    content: '';
    width: 200px;
    height: 200px;
    position: absolute;
    top: -50px;
    left: -50px;
    transform: rotate(30deg);
    background-color: rgb(255 0 0 / 100%);
    z-index: 0;
    box-shadow: rgb(0 0 0 / 20%) 0px 10px 20px;
  }

  &::after {
    content: '';
    width: 200px;
    height: 200px;
    position: absolute;
    top: -50px;
    left: -35px;
    transform: rotate(30deg);
    background-color: rgb(255 0 0 / 30%);
    z-index: 0;
    box-shadow: rgb(0 0 0 / 20%) 0px 10px 20px;
  }
}
</style>