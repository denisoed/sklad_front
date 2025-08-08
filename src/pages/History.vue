<template>
  <q-page>
    <div class="container">
      <PageTitle :title="title">
        <div>
          <q-card-section class="q-pt-none text-primary">
            <b>История</b> - содержит список событий созданых пользователями.
          </q-card-section>
          <q-card-section class="q-pt-none">
            <ul>
              <li>Историю невозможно удалить.</li>
              <li>История записывается независимо от роли.</li>
              <li>Кнопка "<q-icon color="primary" size="sm" name="search" />" поможет отфильтровать историю.
              </li>
            </ul>
          </q-card-section>
        </div>
      </PageTitle>
      <FilterDates
        @on-change="onChangeDates"
        class="full-width"
        :selected-tab="0"
      />
      <q-table
        :rows="historyRows"
        :columns="columns"
        :loading="fetchHistoryLoading"
        :pagination="pagination"
        row-key="name"
        separator="cell"
        class="histories-table block-bg full-width q-mb-sm q-mt-md border-radius-sm"
        hide-pagination
        no-data-label="Нет данных"
      >
        <template #body="props">
          <q-tr
            :props="props"
            @click="push(`/product/${props.row.productId}`)"
            class="cursor-pointer"
          >
            <q-td
              key="action"
              :props="props"
              :style="`background-color: ${props.row.actionColor}1A`"
            >
              {{ HISTORY_ACTIONS[props.row.action] }}
            </q-td>
            <q-td key="fullname" :props="props">
              {{ props.row.fullname }}
            </q-td>
            <q-td key="productId" :props="props">
              {{ props.row.productId ? `#${props.row.productId}` : '-' }}
            </q-td>
            <q-td key="description" :props="props">
              {{ props.row.description }}
            </q-td>
            <q-td key="created_at" :props="props">
              {{ formatTimeAgo(props.row.created_at) }}
              <q-tooltip>
                {{ props.row.created_at }}
              </q-tooltip>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <FilterHistory
      :opened="openedFilterHistory"
      :users="skladUsers"
      @close="openedFilterHistory = false"
      @on-search="onSearch"
    />
    <div class="fixed-bottom-right q-pb-xl q-mb-md q-mr-md fixed">
      <q-btn
        icon="search"
        round
        push
        size="lg"
        color="primary"
        class="q-mb-xl"
        @click="openedFilterHistory = true"
      />
    </div>
  </q-page>
</template>

<script>
import moment from 'moment'
import {
  computed,
  defineComponent,
  onBeforeMount,
  ref
} from 'vue'
import FilterHistory from 'src/components/FilterHistory.vue'
import useSklads from 'src/modules/useSklads'
import useHistory from 'src/modules/useHistory'
import useDate from 'src/modules/useDate'
import { useRoute, useRouter } from 'vue-router'
import FilterDates from 'src/components/FilterDates.vue'
import PageTitle from 'src/components/PageTitle.vue'
import {
  HISTORY_ACTIONS,
  HISTORY_ACTIONS_COLORS,
  FILTER_FORMAT
} from 'src/config'

const columns = [
  {
    name: 'action',
    label: 'Событие',
    align: 'left',
    field: 'action',
  },
  {
    name: 'fullname',
    label: 'Автор',
    field: 'fullname',
    align: 'left',
  },
  {
    name: 'productId',
    label: 'Товар',
    field: 'productId',
    align: 'left',
  },
  {
    name: 'description',
    label: 'Описание',
    field: 'description',
    align: 'left',
  },
  {
    name: 'created_at',
    label: 'Дата',
    field: 'created_at',
    align: 'left',
  },
]

export default defineComponent({
  name: 'HistoryPage',
  components: {
    FilterDates,
    FilterHistory,
    PageTitle,
  },
  setup() {
    const { push } = useRouter()
    const { params, query } = useRoute()
    const { formatTimeAgo } = useDate()
    const TODAY = Date.now()
    const {
      fetchHistory,
      fetchHistoryLoading,
      historyResult,
      getDescription
    } = useHistory()
    const {
      sklad,
    } = useSklads()

    const openedFilterHistory = ref(false)
    const selectedDates = ref([moment.utc(TODAY).local().format(FILTER_FORMAT)])
    const selectedFilters = ref({})
    const isDateModal = ref(false)
    const pagination = {
      rowsPerPage: -1,
    }

    const skladUsers = computed(() => sklad.value?.users || [])
    const title = computed(() => query?.product ? `История по товару ${query?.product}` : 'История')

    const historyRows = computed(() => {
      return historyResult.value.map(h => ({
        ...h,
        description: getDescription(h.action, h.json)
      }));
    })

    function loadHistories(filters = {}) {
      fetchHistory({
        sklad: params?.skladId,
        dates: selectedDates.value,
        ...(params?.productId && { product: params.productId }),
        ...selectedFilters.value,
        ...filters
      })
    }

    function onChangeDates(dates = []) {
      selectedDates.value = dates
      loadHistories(dates)
    }
    
    function onSearch(filters) {
      selectedFilters.value = {
        action: filters?.actions?.map(f => f.value) || [],
        users_permissions_user: filters?.people?.map(f => f.value) || [],
      }
      loadHistories({ dates: selectedDates.value, ...selectedFilters.value })
    }

    onBeforeMount(() => {
      loadHistories()
    })

    return {
      columns,
      historyRows,
      fetchHistoryLoading,
      isDateModal,
      onSearch,
      title,
      pagination,
      HISTORY_ACTIONS,
      onChangeDates,
      skladUsers,
      openedFilterHistory,
      HISTORY_ACTIONS_COLORS,
      formatTimeAgo,
      push
    }
  }
})
</script>

<style lang="scss">
  .histories {
    &-cards {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    &-card {
      width: calc(50% - 16px);
      box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

      &_title {
        font-size: 18px;
        color: var(--text-description);
      }

      &_value {
        position: relative;
        font-size: 22px;
        font-weight: bold;
        margin-top: 5px;
      }
    }

    &-table {
      .q-table__top,
      thead tr:first-child th {
        font-weight: bold;
      }

      .action_delete {
        background-color: rgb(255 0 0 / 8%);
      }

      .action_create {
        background-color: rgb(0 255 0 / 8%);
      }

      .action_update {
        background-color: rgb(255 255 0 / 8%);
      }

      .action_sold {
        background-color: rgb(0 0 255 / 8%);
      }
    }
  }
</style>
