<template>
  <div class="mini-tabs" ref="containerRef">
    <SmallCard
      v-for="(s) of list"
      :key="s.id"
      :name="s.name"
      :color="s.color"
      class="mini-tabs_card"
      :class="{ 'mini-tabs_card--active': sId === s.id }"
      v-ripple
      @click="onCardClick(s.id)"
      @mousedown="onHoldStart(s.id)"
      @mouseup="onHoldEnd"
      @mouseleave="onHoldEnd"
      @touchstart.passive="onHoldStart(s.id)"
      @touchend="onHoldEnd"
      @touchcancel="onHoldEnd"
      @contextmenu.prevent
    />
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  toRefs,
  onMounted
} from 'vue'
import SmallCard from 'src/components/UI/SmallCard.vue'

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  },
  selectedId: {
    type: Number,
    default: null
  },
  scrollToActiveTab: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['on-change', 'long-press'])

const { selectedId } = toRefs(props);
const sId = ref(selectedId.value);
const containerRef = ref(null);
const holdTimerId = ref(null);
const isHolding = ref(false);
const suppressNextClick = ref(false);
const HOLD_DELAY_MS = 600;

function changeTab(id) {
  sId.value = id;
  emit('on-change', id);
}

function onLongPress(id) {
  emit('long-press', id);
}

function clearHoldTimer() {
  if (holdTimerId.value) {
    clearTimeout(holdTimerId.value);
    holdTimerId.value = null;
  }
  isHolding.value = false;
}

function onHoldStart(id) {
  clearHoldTimer();
  isHolding.value = true;
  holdTimerId.value = setTimeout(() => {
    if (isHolding.value) {
      suppressNextClick.value = true;
      onLongPress(id);
    }
    clearHoldTimer();
  }, HOLD_DELAY_MS);
}

function onHoldEnd() {
  clearHoldTimer();
}

function onCardClick(id) {
  if (suppressNextClick.value) {
    suppressNextClick.value = false;
    return;
  }
  changeTab(id);
}

function scrollToActiveTab() {
  if (!containerRef.value) return;
  
  const activeTab = containerRef.value.querySelector('.mini-tabs_card--active');
  if (activeTab) {
    const containerRect = containerRef.value.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const scrollLeft = activeTab.offsetLeft - (containerRect.width / 2) + (tabRect.width / 2);
    containerRef.value.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  }
}

watch(selectedId, (id) => {
  sId.value = id;
})

onMounted(() => {
  if (props.scrollToActiveTab) {
    setTimeout(() => {
      scrollToActiveTab();
    }, 1000);
  }
})
</script>

<style lang="scss" scoped>
.mini-tabs {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  width: 100%;
  position: relative;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  &_card {
    opacity: 0.4;
    
    &--active {
      opacity: 1;
      box-shadow: var(--box-shadow);
    }
  }
}
</style>
