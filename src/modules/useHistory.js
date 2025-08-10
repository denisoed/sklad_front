import moment from 'moment'
import { computed, watch } from 'vue'
import {
  CREATE_HISTORY,
  LIST_HISTORIES
} from 'src/graphql/history'
import {
  DISPLAY_FORMAT,
  DATE_TIME_FORMAT,
  HISTORY_ACTIONS_COLORS,
  DAY,
  HISTORY_SOLD,
  HISTORY_RETURN,
  HISTORY_DELETE,
  HISTORY_CREATE,
  HISTORY_UPDATE
} from 'src/config'
import { apolloClient } from 'src/boot/apollo'
import { useRoute } from 'vue-router'
import { useLazyQuery } from '@vue/apollo-composable'
import useProfile from 'src/modules/useProfile'
import { useHistoriesStore } from 'src/stores/histories'
import { useI18n } from 'vue-i18n'

const VIEWED_HISTORY = 'sklad_viewed_history'

// Cache for getDescription results
const descriptionCache = new Map()

const useHistory = () => {
  const historiesStore = useHistoriesStore()
  const { params } = useRoute()
  const { profile } = useProfile()
  const { t: $t, locale } = useI18n({ useScope: 'global' })
  const {
    load,
    result: historyRes,
    loading: fetchHistoryLoading
  } = useLazyQuery(LIST_HISTORIES)

  const lastViewed = localStorage.getItem(VIEWED_HISTORY) || moment.utc().startOf(DAY).format(DATE_TIME_FORMAT)

  function fetchHistory(where, limit = 100, start = 0) {
    load(
      null,
      {
        where,
        start,
        limit,
        sort: 'created_at:desc',
      },
      { fetchPolicy: 'network-only' }
    )
  }

  async function createHistory(data) {
    await apolloClient.mutate({
      mutation: CREATE_HISTORY,
      variables: {
        data: {
          ...data,
          userId: +profile.value?.id || null,
        }
      }
    })
  }

  async function history(action, description) {
    if (!action) throw new Error('Agr "action" is missing!'); 
    if (!description) throw new Error('Agr "description" is missing!'); 
    await apolloClient.mutate({
      mutation: CREATE_HISTORY,
      variables: {
        data: {
          skladId: +params?.skladId || null,
          userId: +profile.value?.id || null,
          action,
          description
        }
      }
    })
  }

  function setViewedHistory() {
    localStorage.setItem(VIEWED_HISTORY, moment.utc().format(DATE_TIME_FORMAT))
  }

  // Optimized getDescription with caching and i18n
  function getDescription(action, json) {
    const currentLocale = (locale && locale.value) ? locale.value : 'ru-RU'
    // Create cache key from locale, action and json
    const cacheKey = `${currentLocale}_${action}_${JSON.stringify(json)}`

    // Check cache first
    if (descriptionCache.has(cacheKey)) {
      return descriptionCache.get(cacheKey)
    }

    // Generate description
    let description = ''

    const productPrefix = json?.name
      ? $t('history.descriptionTemplates.productPrefix', { name: json.name })
      : ''

    const sizesList = Array.isArray(json?.sizes) ? json.sizes.join(', ') : ''
    const count = json?.countSizes || 0
    const pieces = $t('common.pieces')
    const origPrice = json?.origPrice || 0
    const newPrice = json?.newPrice || 0

    const descrs = {
      [HISTORY_SOLD]: json?.sizes?.length
        ? $t('history.descriptionTemplates.soldWithSizes', {
            productPrefix,
            sizes: sizesList,
          })
        : $t('history.descriptionTemplates.soldWithoutSizes', {
            productPrefix,
            count,
            pieces,
          }),
      [HISTORY_RETURN]: json?.sizes?.length
        ? $t('history.descriptionTemplates.returnWithSizes', {
            sizes: sizesList,
          })
        : $t('history.descriptionTemplates.returnWithoutSizes', {
            count,
            pieces,
          }),
      [HISTORY_DELETE]: $t('history.descriptionTemplates.delete', { name: json?.name }),
      [HISTORY_CREATE]: json?.sizes?.length
        ? $t('history.descriptionTemplates.createdWithSizes', {
            name: json?.name,
            origPrice,
            newPrice,
            sizes: sizesList,
          })
        : $t('history.descriptionTemplates.createdWithCount', {
            name: json?.name,
            origPrice,
            newPrice,
            count,
            pieces,
          }),
      [HISTORY_UPDATE]: (() => {
        const type = json?.type
        const labelKey = `history.descriptionTemplates.update.${type}`
        const label = $t(labelKey)

        const value = (type === 'removedSizes' || type === 'addedSizes')
          ? json?.sizes
          : $t('history.descriptionTemplates.update.valueArrow', {
              old: json?.old,
              new: json?.new,
            })

        return `${label}: ${value}`
      })(),
    }
  
    description = descrs[action] || ''

    // Cache the result
    descriptionCache.set(cacheKey, description)

    // Limit cache size to prevent memory leaks
    if (descriptionCache.size > 1000) {
      const firstKey = descriptionCache.keys().next().value
      descriptionCache.delete(firstKey)
    }

    return description
  }

  const historyResult = computed(() => {
    const histories = historiesStore.getHistories;
    if (!histories?.length) return []
    return histories.map(a => ({
      productId: a?.productId,
      skladName: a.skladName,
      action: a.action,
      json: a.json,
      created_at: moment(a.created_at).format(DISPLAY_FORMAT),
      fullname: a?.fullname ||
        a?.email ||
        a?.telegramId ||
        a?.userId,
      actionColor: HISTORY_ACTIONS_COLORS[a.action],
      isNew: moment(a.created_at).isAfter(lastViewed)
    }));
  })

  watch(historyRes, (val) => {
    const histories = val?.listHistories || []
    historiesStore.setHistories(histories)
  })

  return {
    fetchHistory,
    createHistory,
    history,
    fetchHistoryLoading,
    historyResult,
    setViewedHistory,
    lastViewed,
    getDescription
  }
}

export default useHistory
