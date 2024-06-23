<template>
  <div class="notify-list relative">
    <q-btn @click="dialog = true" round push class="notify-list_btn text-grey" v-vibrate>
      <q-icon name="mdi-bell-outline" />
      <div v-if="history?.length" class="notify-list_alert" />
    </q-btn>
    <q-dialog v-model="dialog" position="right" full-height>
      <q-swipe-to-close v-model="dialog" direction="right">
        <q-card class="notify-list_wrap" style="width: 300px;">
          <q-card-section class="flex items-center q-pb-none">
            <div class="text-subtitle1">Уведомления</div>
            <q-btn icon="mdi-chevron-right" class="q-ml-auto" flat round dense v-close-popup v-vibrate />
          </q-card-section>
          <q-card-section v-if="historyRows?.length" class="flex column q-gap-md">
            <router-link
              v-for="(h, i) of historyRows"
              :key="i"
              class="notify-list_item block-bg q-pa-md"
              :style="`border-color: ${h.actionColor}2A`"
              :to="`/product/${h.productId}`"
            >
              <!-- <div class="notify-list_alert" /> -->
              <div class="notify-list_item-sklad text-grey q-mb-xs">Склад: <b>{{ h.sklad }}</b></div>
              <div class="notify-list_item-sklad text-grey q-mb-xs">Товар: <b>#{{ h.productId }}</b></div>
              <div class="notify-list_item-body q-mb-xs">{{ h.description }}</div>
              <div class="flex justify-between items-center">
                <div class="notify-list_item-author text-grey-5">{{ h.fullname }}</div>
                <div class="notify-list_item-date text-grey-5">{{ formatTimeAgo(h.created_at) }}</div>
              </div>
            </router-link>
          </q-card-section>
          <q-card-section v-else class="flex column items-center q-pt-xl">
            <q-icon name="mdi-history" size="md" color="grey" />
            <div class="text-grey q-mt-sm">Новых уведомлений нет</div>
          </q-card-section>
        </q-card>
      </q-swipe-to-close>
    </q-dialog>
  </div>
</template>

<script>
import {
  ref,
  defineComponent,
  watch,
  computed
} from 'vue'
import useHistory from 'src/modules/useHistory'
import useDate from 'src/modules/useDate'

export default defineComponent({
  name: 'NotifyList',
  props: {
    history: {
      type: Array,
      default: () => []
    },
  },
  setup(props) {
    const { setViewedHistory, getDescription } = useHistory()
    const { formatTimeAgo } = useDate()
    const dialog = ref(false)

    const historyRows = computed(() => {
      return props.history.map(h => ({
        ...h,
        description: getDescription(h.action, h.json)
      }));
    })

    watch(dialog, (val) => {
      if (val) {
        setViewedHistory()
      }
    })

    return {
      dialog,
      formatTimeAgo,
      historyRows
    }
  }
})
</script>

<style lang="scss" scoped>
.notify-list {
  &_wrap {
    min-height: 100%;
    background: var(--main-bg);
  }

  &_alert {
    width: 14px;
    height: 14px;
    border-radius: 100%;
    background-color: red;
    border: 2px solid var(--main-bg);
    position: absolute;
    right: 10px;
    top: 8px;
    transition: all 0.2s ease;
  }

  &_item {
    width: 100%;
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
    border-right: 5px solid;
    position: relative;

    > .notify-list_alert {
      top: 5px;
      left: 5px;
      opacity: 0.5;
      width: 10px;
      height: 10px;
    }

    &-body,
    &-sklad {
      font-size: 14px;
    }

    &-author,
    &-date {
      font-size: 12px;
    }
  }
}
</style>
