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
        @on-change="loadCosts"
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
                icon="mdi-trash-can-outline"
                round
                color="deep-orange"
                size="sm"
                @click="remove(props.row)"
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
      
      <q-dialog v-model="dialog" position="bottom">
        <q-card style="width: 350px">
          <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
            <div class="flex column items-center full-width">
              <p class="full-width text-left text-bold q-mb-none text-subtitle1 q-mb-sm">{{ $t('costs.whereSpent') }}</p>
              <q-input
                v-model="description"
                outlined
                :placeholder="$t('costs.exampleDescription')"
                class="q-mb-md full-width"
                enterkeyhint="done"
              />
              <p class="full-width text-left text-bold q-mb-none text-subtitle1 q-mb-sm">{{ $t('costs.howMuchSpent') }}</p>
              <InputPrice
                v-model="sum"
                outlined
                :placeholder="$t('costs.exampleAmount')"
                class="q-mb-md full-width"
              />
            </div>
            <q-separator class="full-width q-mb-md" />
            <div class="flex justify-between no-wrap q-gap-md full-width">
              <q-btn
                class="button-size"
                color="grey"
                icon="mdi-close"
                push
                @click="dialog = false"
              />
              <q-btn
                class="button-size"
                color="primary"
                icon="mdi-check"
                push
                :loading="loadingCost"
                @click="save"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
      <div class="fixed-bottom-right q-mb-xl q-pb-md q-mr-md fixed">
        <q-btn
          v-permissions="[CAN_ADD_COST]"
          color="primary"
          class="q-mb-xl"
          round
          size="lg"
          push
          :loading="deleteLoading"
          @click="openDialog"
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
import moment from 'moment'
import { computed, ref } from 'vue'
import useHelpers from 'src/modules/useHelpers'
import useCosts from 'src/modules/useCosts'
import useMoney from 'src/modules/useMoney'
import InputPrice from 'src/components/InputPrice.vue'
import TableComp from 'src/components/TableComp.vue'
import PageTitle from 'src/components/PageTitle.vue'
import { DISPLAY_FORMAT } from 'src/config'
import { CAN_ADD_COST } from 'src/permissions'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'Costs'
})

const { showSuccess, showError } = useHelpers()
const { formatPrice } = useMoney()
const {
  createCost,
  errorCost,
  loadingCost,
  loadCosts,
  costsResult,
  costsLoading,
  costsRefetch,
  deleteCost,
  deleteError,
  deleteLoading
} = useCosts()
const { t: $t } = useI18n()
const $q = useQuasar()

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

const dialog = ref(false)
const description = ref(null)
const sum = ref(null)

function openDialog() {
  dialog.value = true
}

async function save() {
  await createCost(description.value, sum.value)
  if (!errorCost.value) {
    dialog.value = false
    costsRefetch()
    showSuccess($t('costs.saveSuccess'))
    description.value = null
    sum.value = null
  } else {
    showError($t('common.error') + '. ' + $t('common.tryLater'))
  }
}

function remove(cost) {
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
      color: 'white',
      textColor: 'black',
      label: $t('common.cancel'),
      push: true
    }
  }).onOk(async () => {
    await deleteCost(cost.id)
    if (!deleteError.value) {
      costsRefetch()
      // NOTE: add to history
      showSuccess($t('costs.deleteSuccess'))
    } else {
      showError($t('common.error') + '. ' + $t('common.tryLater'))
    }
  })
}

const rows = computed(() => {
  const costs = costsResult.value?.listCosts || []
  return costs.map(c => ({
    id: c.id,
    fullname: c?.users_permissions_user?.fullname || 'n/a',
    description: c.description,
    sum: formatPrice(c.sum),
    created_at: moment(c.created_at).local().format(DISPLAY_FORMAT)
  }))
})

const costsSum = computed(() => {
  const costs = costsResult.value?.listCosts || []
  const sumValue = costs.reduce((prev, next) => prev + next.sum, 0)
  return formatPrice(sumValue)
})
</script>
