<template>
  <div class="flex no-wrap items-center">
    <SwitchTabs
      v-if="withButtons"
      :selected-tab="localSelectedTab"
      class="q-mr-md"
      :tabs="TABS"
      @on-change="onChangeTab"
      style="width: auto;"
    />
    <q-btn
      icon="event"
      round
      :color="calendarDate ? 'primary' : ''"
      class="q-ml-auto"
    >
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date
          v-model="calendarDate"
          range
          multiple
          :locale="qDateLocale"
          :options="optionsFn"
        >
          <div class="row items-center no-wrap justify-end q-gap-xs">
            <q-btn :label="$t('common.cancel')" rounded color="grey" flat v-close-popup />
            <q-btn :label="$t('common.clear')" rounded color="deep-orange" flat @click="clear" />
            <q-btn :label="$t('common.ok')" rounded color="primary" flat @click="filterByCalendar" v-close-popup />
          </div>
          <p class="text-grey q-mt-md q-mb-none text-caption">{{ $t('filter.doubleClickHint') }}</p>
        </q-date>
      </q-popup-proxy>
    </q-btn>
  </div>
</template>

<script setup>
import moment from 'moment'
import {
  ref,
  computed
} from 'vue'
import { useI18n } from 'vue-i18n'
import useDate from 'src/modules/useDate'
import SwitchTabs from 'src/components/SwitchTabs.vue'
import { FILTER_FORMAT, DAY, WEEK, MONTH } from 'src/config'

const props = defineProps({
  withButtons: {
    type: Boolean,
    default: true
  },
  disablePrevDates: {
    type: Boolean,
    default: false
  },
  selectedToday: {
    type: Boolean,
    default: false
  },
  selectedTab: {
    type: Number,
    default: 2
  }
})

const emit = defineEmits(['on-change'])

const { t: $t, tm } = useI18n()
const { getBetweenDays, getCurrentWeek, getCurrentMonth } = useDate()

const TABS = computed(() => [
  {
    label: $t('statistics.day'),
    value: DAY
  },
  {
    label: $t('statistics.week'),
    value: WEEK
  },
  {
    label: $t('statistics.month'),
    value: MONTH
  },
])

const qDateLocale = computed(() => ({
  /* starting with Sunday */
  days: tm('calendar.days'),
  daysShort: tm('calendar.daysShort'),
  months: tm('calendar.months'),
  monthsShort: tm('calendar.monthsShort'),
  firstDayOfWeek: 1, // 0-6, 0 - Sunday, 1 Monday, ...
  format24h: true,
  pluralDay: $t('calendar.pluralDay')
}))

const calendarDate = ref(props.selectedToday ? moment().startOf(DAY).format(FILTER_FORMAT) : null)
const localSelectedTab = ref(props.selectedTab)

function fetchActivities(dates = null) {
  emit('on-change', dates)
}

function optionsFn(date) {
  if (props.disablePrevDates) {
    return date >= moment().startOf(DAY).format(FILTER_FORMAT)
  }
  return true
}

function onChangeTab(val) {
  calendarDate.value = null
  let params = {} 
  if (val === MONTH) {
    params = { dates: getCurrentMonth()}
  } else if (val === WEEK) {
    params = { dates: getCurrentWeek()}
  } else {
    params = { dates: [moment().startOf(DAY).format(FILTER_FORMAT)]}
  }
  fetchActivities(params)
}

function filterByCalendar() {
  if (!calendarDate.value) return;
  const dates = calendarDate.value.map(cd => {
    if (typeof cd === 'object') {
      return getBetweenDays(Object.values(cd))
    }
    return cd
  })
  const flatted = dates.flat(1)
  const formattedDates = flatted.map(fd => moment(fd).format(FILTER_FORMAT))
  localSelectedTab.value = null
  fetchActivities({ dates: formattedDates })
}

function clear() {
  calendarDate.value = null
  localSelectedTab.value = props.selectedTab
}
</script>
