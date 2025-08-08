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
    
    // Store references for cleanup
    let mutationObserver = null;
    let resizeListener = null;
    let lastTouchMoveTime = 0;
    const THROTTLE_DELAY = 16; // ~60fps

    // Memoized direction check
    const isVertical = computed(() => props.direction === 'up' || props.direction === 'down');
    const isHorizontal = computed(() => props.direction === 'left' || props.direction === 'right');

    const containerStyle = computed(() => {
      const transformValue = isVertical.value 
        ? `translateY(${currentY.value}px)`
        : `translateX(${currentY.value}px)`;
      
      return {
        transform: transformValue,
        opacity: isClosing.value ? 0 : 1
      };
    });

    // Throttle function for performance
    function throttle(func, delay) {
      let lastCall = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          return func.apply(this, args);
        }
      };
    }

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

    // Optimized function to find scrollable elements
    function findScrollableElements(container) {
      if (!container) return [];
      
      const scrollableElements = [];
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (node) => {
            const style = window.getComputedStyle(node);
            const isScrollable = style.overflow === 'auto' || 
                               style.overflow === 'scroll' || 
                               style.overflowY === 'auto' || 
                               style.overflowY === 'scroll';
            return isScrollable ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
          }
        }
      );
      
      let node;
      while (node = walker.nextNode()) {
        scrollableElements.push(node);
      }
      
      return scrollableElements;
    }

    // Set overscroll behavior for the component and its children
    function setOverscrollBehavior() {
      if (!SwipeToCloseRef.value) return;
      
      // Set overscroll behavior on the component itself
      SwipeToCloseRef.value.style.overscrollBehavior = 'contain';
      
      // Only process scrollable elements instead of all elements
      const scrollableElements = findScrollableElements(SwipeToCloseRef.value);
      scrollableElements.forEach(element => {
        element.style.overscrollBehavior = 'contain';
        element.style.webkitOverflowScrolling = 'touch';
      });
    }

    // Setup MutationObserver to watch for DOM changes
    function setupMutationObserver() {
      if (!SwipeToCloseRef.value) return null;
      
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

    // Optimized scroll check - only check immediate children and current element
    function canScrollContent(element) {
      if (!element) return false;
      
      // Check if current element is scrollable and not at top
      if (element.scrollHeight > element.clientHeight && element.scrollTop > 0) {
        return true;
      }
      
      // Only check immediate children, not all descendants
      for (let child of element.children) {
        if (child.scrollHeight > child.clientHeight && child.scrollTop > 0) {
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
      
      if (isVertical.value) {
        startY.value = event.touches[0].clientY;
      } else {
        startY.value = event.touches[0].clientX;
      }
      
      currentY.value = 0;
      
      // Block body scroll when starting to swipe
      blockBodyScroll();
    }

    // Throttled touch move handler
    const throttledTouchMove = throttle((event) => {
      if (!isSwiping.value || isClosing.value) return;
      
      let delta;
      if (isVertical.value) {
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
    }, THROTTLE_DELAY);

    function handleTouchMove(event) {
      throttledTouchMove(event);
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
        }, 0);
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

    // Throttled resize handler
    const throttledResize = throttle(() => {
      windowHeight.value = window.innerHeight;
    }, 100);

    // Set overscroll behavior when component mounts
    onMounted(() => {
      setOverscrollBehavior();
      mutationObserver = setupMutationObserver();
      
      // Add throttled resize listener
      resizeListener = throttledResize;
      window.addEventListener('resize', resizeListener);
    });

    // Cleanup on component unmount
    onUnmounted(() => {
      unblockBodyScroll();
      
      // Cleanup MutationObserver
      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
      }
      
      // Cleanup resize listener
      if (resizeListener) {
        window.removeEventListener('resize', resizeListener);
        resizeListener = null;
      }
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