<template>
  <div class="flex no-wrap items-center">
    <SwitchTabs
      v-if="withButtons"
      :selected-tab="selectedTab"
      class="q-mr-md"
      :tabs="TABS"
      @on-change="onChange"
      style="width: auto;"
    />
    <q-btn
      icon="event"
      round
      color="primary"
      class="q-ml-auto"
      v-vibrate
    >
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date
          v-model="calendarDate"
          range
          multiple
          :options="optionsFn"
        >
          <div class="row items-center no-wrap justify-end q-gap-xs">
            <q-btn label="Отмена" rounded color="grey" flat v-close-popup v-vibrate />
            <q-btn label="Очистить" rounded color="deep-orange" flat @click="clear" v-vibrate />
            <q-btn label="OK" rounded color="primary" flat @click="filterByCalendar" v-close-popup v-vibrate />
          </div>
          <p class="text-grey q-mt-md q-mb-none text-caption">Двойное нажатие по дате вернёт результат за один день.</p>
        </q-date>
      </q-popup-proxy>
    </q-btn>
  </div>
</template>

<script>
import moment from 'moment'
import {
  defineComponent,
  ref
} from 'vue'
import useDate from 'src/modules/useDate'
import SwitchTabs from 'src/components/SwitchTabs.vue'
import { FILTER_FORMAT, DAY, WEEK, MONTH } from 'src/config'

const TABS = [
  {
    label: 'День',
    value: DAY
  },
  {
    label: 'Неделя',
    value: WEEK
  },
  {
    label: 'Месяц',
    value: MONTH
  },
]

export default defineComponent({
  name: 'FilterDates',
  components: {
    SwitchTabs
  },
  props: {
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
  },
  emits: ['on-change'],
  setup(props, { emit }) {
    const { getBetweenDays, getCurrentWeek, getCurrentMonth } = useDate()

    const calendarDate = ref(props.selectedToday ? moment().startOf(DAY).format(FILTER_FORMAT) : null)

    function loadActivities(dates = null) {
      emit('on-change', dates)
    }

    function optionsFn(date) {
      if (props.disablePrevDates) {
        return date >= moment().startOf(DAY).format(FILTER_FORMAT)
      }
      return true
    }

    function onChange(val) {
      let params = {} 
      if (val === MONTH) {
        params = { dates: getCurrentMonth()}
      } else if (val === WEEK) {
        params = { dates: getCurrentWeek()}
      } else {
        params = { dates: [moment().startOf(DAY).format(FILTER_FORMAT)]}
      }
      loadActivities(params)
    }

    function filterByCalendar() {
      const dates = calendarDate.value.map(cd => {
        if (typeof cd === 'object') {
          return getBetweenDays(Object.values(cd))
        }
        return cd
      })
      const flatted = dates.flat(1)
      const formattedDates = flatted.map(fd => moment(fd).format(FILTER_FORMAT))
      loadActivities({ dates: formattedDates })
    }

    function clear() {
      calendarDate.value = null;
    }

    return {
      calendarDate,
      TABS,
      filterByCalendar,
      clear,
      optionsFn,
      onChange
    }
  }
})
</script>
