<template>
  <div class="notify-list relative">
    <q-btn @click="dialog = true" round push class="notify-list_btn text-grey">
      <q-icon name="mdi-bell-outline" />
      <div v-if="hasNewHistory" class="notify-list_alert" />
    </q-btn>
    <q-dialog v-model="dialog" position="right" full-height>
      <q-card class="notify-list_wrap" style="width: 300px;">
        <q-card-section class="flex items-center q-pb-none">
          <div class="text-subtitle1">{{ $t('common.notifications') }}</div>
          <q-btn icon="mdi-chevron-right" class="q-ml-auto" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section v-if="historyRows?.length" class="notify-list_items">
          <div class="notify-list_list q-px-md">
            <router-link
              v-for="h in visibleRows"
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
              >{{ $t(`history.actions.${h.action}`) }}</div>
              <div class="notify-list_item-sklad text-grey q-mb-xs">{{ $t('common.warehouse') }}: <b>{{ h.skladName }}</b></div>
              <div class="notify-list_item-sklad text-grey q-mb-xs">ID: {{ h.productId ? `#${h.productId}` : '-' }}</div>
              <div class="notify-list_item-body q-mb-xs">{{ h.description }}</div>
              <div class="flex justify-between items-center">
                <div class="notify-list_item-author text-grey-5">{{ h.fullname }}</div>
                <div class="notify-list_item-date text-grey-5 q-ml-auto">{{ h.formattedTime }}</div>
              </div>
            </router-link>

            <div v-if="hasMore" class="q-my-md flex justify-center">
              <q-btn
                color="primary"
                push
                dense
                class="full-width"
                @click="loadMore"
              >
                {{ $t('common.more') }}
              </q-btn>
            </div>
          </div>
        </q-card-section>
        <q-card-section v-else class="flex column items-center q-pt-xl">
          <q-icon name="mdi-history" size="md" color="grey" />
          <div class="text-grey q-mt-sm">{{ $t('common.noNewNotifications') }}</div>
        </q-card-section>
      </q-card>
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

const props = defineProps({
  history: {
    type: Array,
    default: () => []
  },
})

const { setViewedHistory, getDescription } = useHistory()
const { formatTimeAgo } = useDate()
const dialog = ref(false)

// Memoized history processing
const historyRows = computed(() => {
  return props.history.map(h => ({
    ...h,
    description: getDescription(h.action, h.json),
    formattedTime: formatTimeAgo(h.created_at),
    styleKey: `${h.actionColor}2A`,
    virtualKey: `${h.id || h.created_at || Math.random()}`
  }));
})

const hasNewHistory = computed(() => historyRows.value.some(h => h.isNew))

const getItemStyle = (item) => {
  return {
    borderColor: item.styleKey
  }
}

// Pagination state
const page = ref(1)
const pageSize = ref(20)

const visibleRows = computed(() => historyRows.value.slice(0, page.value * pageSize.value))
const hasMore = computed(() => visibleRows.value.length < historyRows.value.length)

const loadMore = () => {
  page.value += 1
}

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
    max-height: 85vh;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    padding: 8px 0;
  }

  &_item {
    width: 100%;
    display: block;
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius-sm);
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
