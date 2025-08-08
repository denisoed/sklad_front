<template>
  <div class="notify-list relative">
    <q-btn @click="dialog = true" round push class="notify-list_btn text-grey">
      <q-icon name="mdi-bell-outline" />
      <div v-if="hasNewHistory" class="notify-list_alert" />
    </q-btn>
    <q-dialog v-model="dialog" position="right" full-height>
      <SwipeToClose direction="right" @on-close="dialog = false">
        <q-card class="notify-list_wrap" style="width: 300px;">
          <q-card-section class="flex items-center q-pb-none">
            <div class="text-subtitle1">Уведомления</div>
            <q-btn icon="mdi-chevron-right" class="q-ml-auto" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section v-if="historyRows?.length" class="notify-list_items">
            <q-virtual-scroll
              v-bind="virtualScrollProps"
              class="notify-list_virtual-scroll"
            >
              <template v-slot="{ item: h }">
                <router-link
                  :key="h.virtualKey"
                  class="notify-list_item block-bg q-pa-md"
                  :style="getItemStyle(h)"
                  :class="{ 'notify-list_item--old': !h.isNew }"
                  :to="`/product/${h.productId}`"
                >
                  <div v-if="h.isNew" class="notify-list_alert" />
                  <div
                    class="notify-list_item-type absolute-top-right q-ma-sm text-black border-radius-sm q-px-xs q-py-none"
                    :style="{ backgroundColor: h.actionColor }"
                  >{{ HISTORY_ACTIONS[h.action] }}</div>
                  <div class="notify-list_item-sklad text-grey q-mb-xs">Склад: <b>{{ h.sklad }}</b></div>
                  <div class="notify-list_item-sklad text-grey q-mb-xs">ID: {{ h.productId ? `#${h.productId}` : '-' }}</div>
                  <div class="notify-list_item-body q-mb-xs">{{ h.description }}</div>
                  <div class="flex justify-between items-center">
                    <div class="notify-list_item-author text-grey-5">{{ h.fullname }}</div>
                    <div class="notify-list_item-date text-grey-5 q-ml-auto">{{ h.formattedTime }}</div>
                  </div>
                </router-link>
              </template>
            </q-virtual-scroll>
          </q-card-section>
          <q-card-section v-else class="flex column items-center q-pt-xl">
            <q-icon name="mdi-history" size="md" color="grey" />
            <div class="text-grey q-mt-sm">Новых уведомлений нет</div>
          </q-card-section>
        </q-card>
      </SwipeToClose>
    </q-dialog>
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  computed,
} from 'vue'
import useHistory from 'src/modules/useHistory'
import useDate from 'src/modules/useDate'
import SwipeToClose from 'src/components/SwipeToClose.vue'
import { HISTORY_ACTIONS } from 'src/config'

const props = defineProps({
  history: {
    type: Array,
    default: () => []
  },
})

const { setViewedHistory, getDescription } = useHistory()
const { formatTimeAgo } = useDate()
const dialog = ref(false)

// Memoized history processing with pre-computed values for virtual scroll
const historyRows = computed(() => {
  return props.history.map(h => ({
    ...h,
    description: getDescription(h.action, h.json),
    formattedTime: formatTimeAgo(h.created_at),
    // Pre-compute style to avoid inline style calculations during render
    styleKey: `${h.actionColor}2A`,
    // Ensure unique key for virtual scroll
    virtualKey: `${h.id || h.created_at || Math.random()}`
  }));
})

const hasNewHistory = computed(() => historyRows.value.some(h => h.isNew))

// Memoized style function to avoid repeated calculations
const getItemStyle = (item) => {
  return {
    borderColor: item.styleKey
  }
}

// Optimize virtual scroll performance
const virtualScrollProps = computed(() => ({
  items: historyRows.value,
  itemSize: 120,
  virtualScrollItemSize: 120,
  virtualScrollStickySizeStart: 0,
  virtualScrollStickySizeEnd: 0
}))

watch(dialog, (val) => {
  if (val) {
    setViewedHistory()
  }
})
</script>

<style lang="scss" scoped>
.notify-list {
  &_wrap {
    min-height: 100%;
    background: var(--main-bg);
    // Optimize for hardware acceleration
    will-change: transform;
    transform: translateZ(0);
  }

  &_alert {
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background-color: red;
    position: absolute;
    right: 10px;
    top: 8px;
    // Optimize transition for better performance
    transition: opacity 0.2s ease;
    will-change: opacity;
  }

  &_items {
    height: 85vh;
    overflow: hidden; // Changed from auto to hidden for virtual scroll
    // Optimize scrolling performance
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    // Hardware acceleration for smooth scrolling
    transform: translateZ(0);
    will-change: scroll-position;
    // Optimize for virtual scrolling
    contain: layout style paint;
  }

  &_virtual-scroll {
    height: 100%;
    // Ensure proper height for virtual scroll container
    .q-virtual-scroll__content {
      padding: 8px 0; // Add some padding for better visual spacing
    }
  }

  &_item {
    width: 100%;
    display: block;
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
    border-right: 5px solid;
    position: relative;
    margin-bottom: 8px; // Add margin between items
    // Optimize for hardware acceleration
    transform: translateZ(0);
    will-change: transform;
    // Optimize rendering
    contain: layout style;

    > .notify-list_alert {
      top: 5px;
      left: 5px;
      opacity: 0.8;
      width: 6px;
      height: 6px;
    }

    &-body,
    &-sklad {
      font-size: 14px;
    }

    &-author,
    &-date {
      font-size: 12px;
    }

    &--old {
      opacity: 0.6;
    }

    &-type {
      font-size: 10px;
    }
  }
}

// Optimize transitions during swipe
.swipe-to-close--swiping {
  .notify-list_item {
    transition: none !important;
  }
  
  .notify-list_alert {
    transition: none !important;
  }
  
  .notify-list_items {
    // Disable scrolling during swipe to prevent conflicts
    overflow: hidden !important;
  }
}
</style>
