<template>
  <q-layout view="lHh Lpr fff">
    <!-- Page -->
    <q-page-container>
      <transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        appear
        :duration="300"
      >
        <q-scroll-area
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
          style="height: 100vh; max-width: 100%;"
        >
          <router-view />
        </q-scroll-area>
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AuthLayout',
  setup() {
    const thumbStyle = {
      display: 'none'
    }

    const barStyle = {
      display: 'none'
    }
  
    return {
      thumbStyle,
      barStyle
    }
  }
})
</script>
