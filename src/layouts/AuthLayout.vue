<template>
  <q-layout view="lHh Lpr fff">
    <q-pull-to-refresh @refresh="refresh">
      <!-- Page -->
      <q-page-container>
        <transition
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          appear
          :duration="300"
        >
          <router-view />
        </transition>
      </q-page-container>
    </q-pull-to-refresh>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AuthLayout',
  setup() {
    function refresh(done) {
      window.location.reload()
      done()
    }

    return {
      refresh
    }
  }
})
</script>
