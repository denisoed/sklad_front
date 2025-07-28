<template>
  <div
    ref="SwipeToCloseRef"
    class="swipe-to-close"
    :class="{ 'swipe-to-close--swiping': isSwiping }"
    :style="containerStyle"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @wheel="handleWheel"
  >
    <slot />
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
  onMounted
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
      document.body.style.overscrollBehavior = 'none';
    }

    // Unblock body scroll
    function unblockBodyScroll() {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
    }

    // Set overscroll behavior for the component and its children
    function setOverscrollBehavior() {
      if (SwipeToCloseRef.value) {
        // Set overscroll behavior on the component itself
        SwipeToCloseRef.value.style.overscrollBehavior = 'contain';
        
        // Set overscroll behavior on all scrollable children
        const scrollableElements = SwipeToCloseRef.value.querySelectorAll('*');
        scrollableElements.forEach(element => {
          const computedStyle = window.getComputedStyle(element);
          if (computedStyle.overflow === 'auto' || computedStyle.overflow === 'scroll' || 
              computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll') {
            element.style.overscrollBehavior = 'contain';
            element.style.webkitOverflowScrolling = 'touch';
          }
        });
      }
    }

    // Setup MutationObserver to watch for DOM changes
    function setupMutationObserver() {
      if (SwipeToCloseRef.value) {
        const observer = new MutationObserver(() => {
          setOverscrollBehavior();
        });
        
        observer.observe(SwipeToCloseRef.value, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
        
        return observer;
      }
      return null;
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

    // Handle wheel events to prevent overscroll
    function handleWheel(event) {
      if (!SwipeToCloseRef.value) return;
      
      const target = event.target;
      const isScrollable = target.scrollHeight > target.clientHeight;
      
      if (isScrollable) {
        const isAtTop = target.scrollTop === 0;
        const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight;
        
        // Prevent wheel scroll when at boundaries
        if ((isAtTop && event.deltaY < 0) || (isAtBottom && event.deltaY > 0)) {
          event.preventDefault();
        }
      }
    }

    // Update window height on resize
    window.addEventListener('resize', () => {
      windowHeight.value = window.innerHeight;
    });

    // Set overscroll behavior when component mounts
    onMounted(() => {
      setOverscrollBehavior();
      setupMutationObserver(); // Initialize MutationObserver
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
      handleTouchEnd,
      handleWheel
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
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

  &--swiping {
    transition: none !important;
    touch-action: none;
    
    // Prevent any scrolling when swiping
    * {
      touch-action: none !important;
      -webkit-overflow-scrolling: auto !important;
    }
  }

  // Block overscroll on all child elements
  * {
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
}
</style>