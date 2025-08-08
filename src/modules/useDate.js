import moment from 'moment'
import { FILTER_FORMAT } from 'src/config'

// Cache for formatTimeAgo results
const timeAgoCache = new Map()
const CACHE_DURATION = 60000 // 1 minute cache

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
      return 'дней'
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

  // Optimized formatTimeAgo with caching
  function formatTimeAgo(dateString) {
    const now = Date.now()
    
    // Check cache first
    if (timeAgoCache.has(dateString)) {
      const cached = timeAgoCache.get(dateString)
      if (now - cached.timestamp < CACHE_DURATION) {
        return cached.result
      } else {
        timeAgoCache.delete(dateString)
      }
    }
    
    const date = new Date(dateString);
    const diffMilliseconds = now - date.getTime();
    const minutes = Math.floor(diffMilliseconds / (60 * 1000));
    const hours = Math.floor(diffMilliseconds / (60 * 60 * 1000));
    const days = Math.floor(diffMilliseconds / (24 * 60 * 60 * 1000));
    const weeks = Math.floor(diffMilliseconds / (7 * 24 * 60 * 60 * 1000));
    const months = Math.floor(diffMilliseconds / (30 * 24 * 60 * 60 * 1000));
    
    let result
    if (minutes < 1) {
      result = 'только что';
    } else if (minutes < 60) {
      result = `${minutes} ${pluralize(minutes, 'min')} назад`;
    } else if (hours < 24) {
      result = `${hours} ${pluralize(hours, 'hour')} назад`;
    } else if (days < 7) {
      result = `${days} ${pluralize(days, 'day')} назад`;
    } else if (weeks < 4) {
      result = `${weeks} ${pluralize(weeks, 'week')} назад`;
    } else {
      result = `${months} ${pluralize(months, 'month')} назад`;
    }
    
    // Cache the result
    timeAgoCache.set(dateString, {
      result,
      timestamp: now
    })
    
    // Limit cache size to prevent memory leaks
    if (timeAgoCache.size > 500) {
      const firstKey = timeAgoCache.keys().next().value
      timeAgoCache.delete(firstKey)
    }
    
    return result
  }

  
  return {
    getCurrentWeek,
    getCurrentMonth,
    getBetweenDays,
    formatTimeAgo
  };
};

export default useDate;
