import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { FILTER_FORMAT } from 'src/config'

const useDate = () => {
  const { t: $t } = useI18n()

  function getCurrentWeek() {
    const currentDate = moment();
    const weekStart = currentDate.clone().startOf('isoWeek');
    const days = [];
    for (let i = 0; i <= 6; i++) {
      days.push(moment(weekStart).add(i, 'days').format(FILTER_FORMAT));
    }
    return days;
  };

  function getCurrentMonth() {
    const daysInMonth = moment().daysInMonth();
    const startOfMonth = moment().startOf('month').format(FILTER_FORMAT);
    const days = [];
    for (let i = 0; i <= (daysInMonth - 1); i++) {
      days.push(moment(startOfMonth).add(i, 'days').format(FILTER_FORMAT));
    }
    return days;
  };

  function getBetweenDays(dates) {
    const startDay = moment(dates[0]).format(FILTER_FORMAT)
    const endDay = moment(dates[1]).format(FILTER_FORMAT)
    const count = Math.abs(moment(startDay).diff(endDay, 'days'))
    const days = [];
    for (let i = 0; i <= count; i++) {
      days.push(moment(startDay).add(i, 'days').format(FILTER_FORMAT));
    }
    return days;
  }

  function pluralize(value, type) {
    if (type === 'min') {
      if (value <= 1) return $t('useDate_38')
      if (value > 1 && value <= 4) return $t('useDate_39')
      return $t('useDate_40')
    }
    if (type === 'hour') {
      if (value <= 1) return $t('useDate_43')
      if (value > 1 && value <= 4) return $t('useDate_44')
      return $t('useDate_45')
    }
    if (type === 'day') {
      if (value <= 1) return $t('useDate_48')
      if (value > 1 && value <= 4) return $t('useDate_49')
      return $t('useDate_50')
    }
    if (type === 'week') {
      if (value <= 1) return $t('useDate_53')
      if (value > 1 && value <= 4) return $t('useDate_54')
      return $t('useDate_55')
    }
    if (type === 'month') {
      if (value <= 1) return $t('useDate_58')
      if (value > 1 && value <= 4) return $t('useDate_59')
      return $t('useDate_60')
    }
  }

  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMilliseconds = now - date;
    const minutes = Math.floor(diffMilliseconds / (60 * 1000));
    const hours = Math.floor(diffMilliseconds / (60 * 60 * 1000));
    const days = Math.floor(diffMilliseconds / (24 * 60 * 60 * 1000));
    const weeks = Math.floor(diffMilliseconds / (7 * 24 * 60 * 60 * 1000));
    const months = Math.floor(diffMilliseconds / (30 * 24 * 60 * 60 * 1000));
    if (minutes < 1) {
      return $t('useDate_74');
    } else if (minutes < 60) {
      return `${minutes} ${pluralize(minutes, 'min')} назад`;
    } else if (hours < 24) {
      return `${hours} ${pluralize(hours, 'hour')} назад`;
    } else if (days < 7) {
      return `${days} ${pluralize(days, 'day')} назад`;
    } else if (weeks < 4) {
      return `${weeks} ${pluralize(weeks, 'week')} назад`;
    } else {
      return `${months} ${pluralize(months, 'month')} назад`;
    }
  }

  
  return {
    getCurrentWeek,
    getCurrentMonth,
    getBetweenDays,
    formatTimeAgo
  };
};

export default useDate;
