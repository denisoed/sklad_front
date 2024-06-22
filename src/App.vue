<template>
  <div ref="appRef">
    <router-view />
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'App',
  setup() {
    const appRef = ref(null)

    // Ensure the document is scrollable
    function ensureDocumentIsScrollable() {
      const isScrollable =
        document.documentElement.scrollHeight > window.innerHeight;
      // Check if the document is scrollable
      console.log(isScrollable);
      if (!isScrollable) {
        /*
        Set the document's height to 100 % of
        the viewport height plus one extra pixel
        to make it scrollable.
        */
        document.documentElement.style.setProperty(
          "height",
          "calc(100vh + 1px)",
          "important"
        );
      }
    }

    function preventCollapse() {
      if (window.scrollY === 0) {
        window.scrollTo(0, 1);
      }
    }

    onMounted(() => {
      appRef.value.addEventListener('touchstart', preventCollapse);
      ensureDocumentIsScrollable();
    })

    return {
      appRef
    }
  }
})
</script>
