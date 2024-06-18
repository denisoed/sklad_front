import moment from 'moment'
import { FILTER_FORMAT } from 'src/config'

const useDate = () => {
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
      if (value <= 1) return 'минуту'
      if (value > 1 && value <= 4) return 'минуты'
      return 'минут'
    }
    if (type === 'hour') {
      if (value <= 1) return 'час'
      if (value > 1 && value <= 4) return 'часа'
      return 'часов'
    }
    if (type === 'day') {
      if (value <= 1) return 'день'
      if (value > 1 && value <= 4) return 'дня'
      return 'дней'
    }
    if (type === 'week') {
      if (value <= 1) return 'неделю'
      if (value > 1 && value <= 4) return 'недели'
      return 'недель'
    }
    if (type === 'month') {
      if (value <= 1) return 'месяц'
      if (value > 1 && value <= 4) return 'месяца'
      return 'месяцев'
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
      return 'Just now';
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
