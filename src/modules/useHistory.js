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

const VIEWED_HISTORY = 'sklad_viewed_history'

// Cache for getDescription results
const descriptionCache = new Map()

const useHistory = () => {
  const historiesStore = useHistoriesStore()
  const { params } = useRoute()
  const { profile } = useProfile()
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

  async function createHistory({
    productId,
    skladId,
    action,
    json,
  }) {
    await apolloClient.mutate({
      mutation: CREATE_HISTORY,
      variables: {
        data: {
          action,
          json,
          product: productId,
          sklad: skladId,
          users_permissions_user: profile.value?.id,
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
          sklad: params?.skladId,
          users_permissions_user: profile.value?.id,
          action,
          description
        }
      }
    })
  }

  function setViewedHistory() {
    localStorage.setItem(VIEWED_HISTORY, moment.utc().format(DATE_TIME_FORMAT))
  }

  // Optimized getDescription with caching
  function getDescription(action, json) {
    // Create cache key from action and json
    const cacheKey = `${action}_${JSON.stringify(json)}`
    
    // Check cache first
    if (descriptionCache.has(cacheKey)) {
      return descriptionCache.get(cacheKey)
    }
    
    // Generate description
    let description = ''
    
    const descrs = {
      [HISTORY_SOLD]: json?.sizes?.length ?
        `Проданы размеры: ${json?.sizes.join(', ')}` :
        `Продано: ${json?.countSizes || 0}шт`,
      [HISTORY_RETURN]: json?.sizes?.length ?
        `Размеры: ${json?.sizes.join(', ')} - вернули обратно в товар` :
        `${json?.countSizes || 0}шт - вернули обратно в товар`,
      [HISTORY_DELETE]: `${json?.name} - цена: ${json?.origPrice || 0}/${json?.newPrice || 0}, ${json?.sizes?.length ? `размеры: ${json?.sizes.join(', ')}` : `кол-во: ${json?.countSizes}шт`}`,
      [HISTORY_CREATE]: `${json?.name} - цена: ${json?.origPrice || 0}/${json?.newPrice || 0}, ${json?.sizes?.length ? `размеры: ${json?.sizes.join(', ')}` : `кол-во: ${json?.countSizes}шт`}`,
      [HISTORY_UPDATE]: (() => {
        const texts = {
          name: {
            label: 'Обновлено название',
            value: `${json.old} -> ${json.new}`
          },
          color: {
            label: 'Обновлён цвет',
            value: `${json.old} -> ${json.new}`
          },
          origPrice: {
            label: 'Обновлена опт цена',
            value: `${json.old} -> ${json.new}`
          },
          newPrice: {
            label: 'Обновлена роз цена',
            value: `${json.old} -> ${json.new}`
          },
          countSizes: {
            label: 'Обновлено кол-во',
            value: `${json.old} -> ${json.new}`
          },
          removedSizes: {
            label: 'Удалены размеры',
            value: json.sizes
          },
          addedSizes: {
            label: 'Добавлены размеры',
            value: json.sizes
          },
        }
        return `${texts[json?.type]?.label}: ${texts[json?.type]?.value}`
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
      productId: a?.product?.id,
      sklad: a.sklad.name,
      action: a.action,
      json: a.json,
      created_at: moment(a.created_at).format(DISPLAY_FORMAT),
      fullname: a?.users_permissions_user?.fullname ||
        a?.users_permissions_user?.email ||
        a.users_permissions_user?.telegramId,
      actionColor: HISTORY_ACTIONS_COLORS[a.action],
      isNew: moment(a.created_at).isAfter(lastViewed)
    }));
  })

  watch(historyRes, (val) => {
    const histories = val?.listHistories
    if (histories?.length) {
      historiesStore.setHistories(histories)
    }
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
