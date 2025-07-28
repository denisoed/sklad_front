<template>
  <div
    ref="SwipeToCloseRef"
    class="swipe-to-close"
    :class="{ 'swipe-to-close--swiping': isSwiping }"
    :style="containerStyle"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <slot />
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onUnmounted
} from 'vue';

export default defineComponent({
  name: 'SwipeToClose',
  props: {
    target: {
      type: String,
      default: null
    },
    direction: {
      type: String,
      default: 'down',
      validator: (value) => ['up', 'down', 'left', 'right'].includes(value)
    }
  },
  emits: ['on-close'],
  setup(props, { emit }) {
    const SwipeToCloseRef = ref(null);
    const isSwiping = ref(false);
    const startY = ref(0);
    const currentY = ref(0);
    const isClosing = ref(false);
    const threshold = 100; // Minimum distance to trigger close
    const windowHeight = ref(window.innerHeight);

    const containerStyle = computed(() => {
      const isVertical = props.direction === 'up' || props.direction === 'down';
      const isHorizontal = props.direction === 'left' || props.direction === 'right';
      
      if (isVertical) {
        return {
          transform: `translateY(${currentY.value}px)`,
          opacity: isClosing.value ? 0 : 1
        };
      } else if (isHorizontal) {
        return {
          transform: `translateX(${currentY.value}px)`,
          opacity: isClosing.value ? 0 : 1
        };
      }
      
      return {
        transform: `translateY(${currentY.value}px)`,
        opacity: isClosing.value ? 0 : 1
      };
    });

    // Block body scroll when swiping
    function blockBodyScroll() {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }

    // Unblock body scroll
    function unblockBodyScroll() {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    // Check if any element inside can be scrolled up
    function canScrollContent(element) {
      if (!element) return false;
      
      // Check if current element is scrollable and not at top
      if (element.scrollHeight > element.clientHeight && element.scrollTop > 0) {
        return true;
      }
      
      // Check all child elements recursively
      for (let child of element.children) {
        if (canScrollContent(child)) {
          return true;
        }
      }
      
      return false;
    }

    function handleTouchStart(event) {
      if (isClosing.value) return;
      
      // If target is specified, only allow swipe from that element
      if (props.target) {
        const targetElement = document.getElementById(props.target);
        const touchTarget = event.target;
        
        // Check if touch started on target element or its children
        if (!targetElement || (!targetElement.contains(touchTarget) && targetElement !== touchTarget)) {
          return; // Don't start swipe-to-close if not touching target element
        }
      } else {
        // Original behavior: check if content can be scrolled
        if (canScrollContent(SwipeToCloseRef.value)) {
          return; // Don't start swipe-to-close if content can scroll
        }
      }
      
      isSwiping.value = true;
      
      if (props.direction === 'up' || props.direction === 'down') {
        startY.value = event.touches[0].clientY;
      } else {
        startY.value = event.touches[0].clientX;
      }
      
      currentY.value = 0;
      
      // Block body scroll when starting to swipe
      blockBodyScroll();
    }

    function handleTouchMove(event) {
      if (!isSwiping.value || isClosing.value) return;
      
      let delta;
      if (props.direction === 'up' || props.direction === 'down') {
        delta = event.touches[0].clientY - startY.value;
      } else {
        delta = event.touches[0].clientX - startY.value;
      }
      
      // Check direction constraints
      const isValidDirection = 
        (props.direction === 'down' && delta > 0) ||
        (props.direction === 'up' && delta < 0) ||
        (props.direction === 'right' && delta > 0) ||
        (props.direction === 'left' && delta < 0);
      
      if (isValidDirection) {
        currentY.value = Math.abs(delta);
        // Prevent default to block page scroll
        event.preventDefault();
      }
    }

    function handleTouchEnd() {
      if (currentY.value >= threshold) {
        isClosing.value = true;
        currentY.value = windowHeight.value;
        
        // Wait for animation to complete before emitting close
        setTimeout(() => {
          emit('on-close');
          isClosing.value = false;
          currentY.value = 0;
          unblockBodyScroll();
        }, 300);
      } else {
        currentY.value = 0;
        unblockBodyScroll();
      }
      
      isSwiping.value = false;
    }

    // Update window height on resize
    window.addEventListener('resize', () => {
      windowHeight.value = window.innerHeight;
    });

    // Cleanup on component unmount
    onUnmounted(() => {
      unblockBodyScroll();
    });

    return {
      SwipeToCloseRef,
      isSwiping,
      isClosing,
      containerStyle,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd
    }
  },
});
</script>

<style lang="scss" scoped>
.swipe-to-close {
  transition: all 300ms ease-in-out;
  position: relative;
  touch-action: pan-y;
  will-change: transform, opacity;

  &--swiping {
    transition: none !important;
    touch-action: none;
    
    // Prevent any scrolling when swiping
    * {
      touch-action: none !important;
      -webkit-overflow-scrolling: auto !important;
    }
  }
}
</style>