<template>
  <q-page>
    <div class="container">
      <PageTitle :title="$t('costs.financialExpenses')">
        <div>
          <q-card-section class="q-pt-none">
            <span v-html="$t('costs.description')" />
          </q-card-section>
          <q-card-section class="q-pt-none text-grey">
            {{ $t('costs.recordAllExpensesHint') }}
          </q-card-section>
        </div>
      </PageTitle>
      <TableComp
        :rows="rows"
        :columns="columns"
        :loading="costsLoading"
        @on-change="fetchCosts"
      >
        <template #body="props">
          <q-tr :props="props">
            <q-td class="text-left">
              {{ props.row.fullname }}
            </q-td>
            <q-td class="text-right">
              {{ props.row.description }}
            </q-td>
            <q-td class="text-right">
              {{ props.row.sum }}
            </q-td>
            <q-td class="text-right">
              {{ props.row.created_at }}
            </q-td>
            <q-td key="actions" :props="props" class="text-right">
              <q-btn
                icon="mdi-pencil-outline"
                round
                color="primary"
                size="sm"
                class="q-mr-sm"
                @click="editCostDialog(props.row)"
              />
              <q-btn
                icon="mdi-trash-can-outline"
                round
                color="deep-orange"
                size="sm"
                @click="deleteCostDialog(props.row)"
              />
            </q-td>
          </q-tr>
        </template>
        <template #bottom-row>
          <q-tr>
            <q-td class="text-left text-bold">
              {{ $t('common.total') }}
            </q-td>
            <q-td class="text-left text-bold" />
            <q-td class="text-right text-bold">
              {{ costsSum }}
            </q-td>
            <q-td class="text-right text-bold" />
            <q-td class="text-right text-bold" />
          </q-tr>
        </template>
      </TableComp>

      <div class="fixed-bottom-right q-mb-xl q-pb-md q-mr-md fixed">
        <q-btn
          v-permissions="[CAN_ADD_COST]"
          color="primary"
          class="q-mb-xl"
          round
          size="lg"
          push
          :loading="deleteLoading"
          @click="createCostDialog"
        >
          <q-icon
            name="mdi-cash-plus"
          />
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import useHelpers from 'src/modules/useHelpers'
import moment from 'moment'
import { computed } from 'vue'
import useCosts from 'src/modules/useCosts'
import useMoney from 'src/modules/useMoney'
import TableComp from 'src/components/TableComp.vue'
import PageTitle from 'src/components/PageTitle.vue'
import { DISPLAY_FORMAT } from 'src/config'
import { CAN_ADD_COST } from 'src/permissions'
import { useI18n } from 'vue-i18n'
import { MANAGE_COST_DIALOG } from 'src/config/dialogs'
import useDialog from 'src/modules/useDialog'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'Costs'
})

const $q = useQuasar()
const route = useRoute()
const { showSuccess, showError } = useHelpers()
const { formatPrice } = useMoney()
const { openDialog } = useDialog()
const {
  fetchCosts,
  costs: costsList,
  costsLoading,
  deleteLoading,
  deleteCost,
  deleteError
} = useCosts()
const { t: $t } = useI18n()

const columns = computed(() => [
  {
    name: 'fullname',
    label: $t('common.author'),
    field: 'fullname',
    align: 'left',
  },
  {
    name: 'description',
    label: $t('common.description'),
    field: 'description',
    align: 'left',
  },
  {
    name: 'sum',
    label: $t('common.amount'),
    align: 'left',
    field: 'sum',
  },
  {
    name: 'created_at',
    label: $t('common.date'),
    field: 'created_at',
    align: 'left',
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'right',
  },
])

function editCostDialog(cost) {
  openDialog(MANAGE_COST_DIALOG, {
    costId: cost?.id,
    description: cost?.description,
    sum: cost?.sum,
    skladId: route.params?.skladId,
  })
}

function createCostDialog() {
  openDialog(MANAGE_COST_DIALOG, {
    skladId: route.params?.skladId,
  })
}

function deleteCostDialog(cost) {
  $q.dialog({
    title: $t('costs.removeCost'),
    message: $t('costs.removeConfirm'),
    cancel: true,
    persistent: true,
    ok: {
      color: 'deep-orange',
      label: $t('common.delete'),
      push: true
    },
    cancel: {
      color: 'grey',
      textColor: 'white',
      label: $t('common.cancel'),
      push: true
    }
  }).onOk(async () => {
    await deleteCost(cost.id)
    if (!deleteError.value) {
      fetchCosts()
      // NOTE: add to history
      showSuccess($t('costs.deleteSuccess'))
    } else {
      showError($t('common.error') + '. ' + $t('common.tryLater'))
    }
  })
}

const rows = computed(() => costsList.value.map(c => ({
    id: c.id,
    fullname: c?.users_permissions_user?.fullname || 'n/a',
    description: c.description,
    sum: formatPrice(c.sum),
    created_at: moment(c.created_at).local().format(DISPLAY_FORMAT)
  }))
)

const costsSum = computed(() => {
  const sumValue = costsList.value.reduce((prev, next) => prev + next.sum, 0)
  return formatPrice(sumValue || 0)
})
</script>
