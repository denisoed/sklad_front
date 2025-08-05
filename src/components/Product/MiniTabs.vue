<template>
  <div class="mini-tabs">
    <SmallCard
      v-for="(s) of list"
      :key="s.id"
      :name="s.name"
      :color="s.color"
      class="mini-tabs_card"
      :class="{ 'mini-tabs_card--active': sId === s.id }"
      v-ripple
      @click="changeTab(s.id)"
    />
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  watch,
  toRefs,
  onMounted
} from 'vue'
import SmallCard from 'src/components/UI/SmallCard.vue'

export default defineComponent({
  name: 'MiniTabs',
  components: {
    SmallCard,
  },
  props: {
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
  },
  emits: ['on-change'],
  setup(props, { emit }) {
    const { selectedId } = toRefs(props);
    const sId = ref(selectedId.value);

    function changeTab(id) {
      sId.value = id;
      emit('on-change', id);
    }

    function scrollToActiveTab() {
      const activeTab = document.querySelector('.mini-tabs_card--active');
      const container = document.querySelector('.mini-tabs');
      if (activeTab && container) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const scrollLeft = activeTab.offsetLeft - (containerRect.width / 2) + (tabRect.width / 2);
        container.scrollTo({
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

    return {
      sId,
      changeTab
    }
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
