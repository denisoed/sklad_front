<template>
  <q-page>
    <div class="container">
      <PageTitle title="Финансовые расходы">
        <div>
          <q-card-section class="q-pt-none text-primary">
            <b>Финансовые расходы</b> - помогут отследить какое кол-во финансов было потрачено за выбранный промежуток времени.
          </q-card-section>
          <q-card-section class="q-pt-none">
            <ul>
              <li>Расходы записываются автоматически при добавлении товара.</li>
              <li>Расходы можно записать вручную, через кнопку
                "<q-icon color="primary" size="sm" name="mdi-cash-plus" />"
              </li>
              <li>Удалить расход можно в последней ячейке таблицы, через кнопку
                "<q-icon color="deep-orange" size="sm" name="mdi-trash-can-outline" />"
              </li>
            </ul>
          </q-card-section>
          <q-card-section class="q-pt-none text-grey-8">
            Старайтесь записывать все расходы, чтобы итоговый финансовый отчёт был максимально достоверным.
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
              Итог
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
              <p class="full-width text-left text-bold q-mb-none text-subtitle1 q-mb-sm">Куда потратили?</p>
              <q-input
                v-model="description"
                outlined
                placeholder="Например: На рекламу"
                class="q-mb-md full-width"
                enterkeyhint="done"
              />
              <p class="full-width text-left text-bold q-mb-none text-subtitle1 q-mb-sm">Сколько потратили?</p>
              <q-input
                ref="inputRef"
                v-model="sum"
                outlined
                placeholder="Например: 250"
                class="q-mb-md full-width"
                enterkeyhint="done"
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

<script>
import { useQuasar } from 'quasar'
import moment from 'moment'
import {
  computed,
  defineComponent,
  ref,
} from 'vue'
import useHelpers from 'src/modules/useHelpers'
import useCosts from 'src/modules/useCosts'
import useMoney from 'src/modules/useMoney'
import useHistory from 'src/modules/useHistory'
import { useCurrencyInput } from 'vue-currency-input'
import TableComp from 'src/components/TableComp.vue'
import PageTitle from 'src/components/PageTitle.vue'
import { DISPLAY_FORMAT, HISTORY_CREATE } from 'src/config'
import { CAN_ADD_COST } from 'src/permissions'

const columns = [
  {
    name: 'fullname',
    label: 'Автор',
    field: 'fullname',
    align: 'left',
  },
  {
    name: 'description',
    label: 'Описание',
    field: 'description',
    align: 'left',
  },
  {
    name: 'sum',
    label: 'Сумма',
    align: 'left',
    field: 'sum',
  },
  {
    name: 'created_at',
    label: 'Дата',
    field: 'created_at',
    align: 'left',
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'right',
  },
]

export default defineComponent({
  name: 'CostsPage',
  components: {
    TableComp,
    PageTitle,
  },
  setup() {
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
    const { history } = useHistory()

    const $q = useQuasar()
    const dialog = ref(false)
    const description = ref(null)
    const sum = ref(null)
    const pagination = {
      rowsPerPage: -1,
    }

    const { inputRef, numberValue } = useCurrencyInput({
      currency: 'USD',
      currencyDisplay: 'hidden',
      hideCurrencySymbolOnFocus: false,
      hideGroupingSeparatorOnFocus: false,
      hideNegligibleDecimalDigitsOnFocus: false,
    })

    function openDialog() {
      dialog.value = true
    }

    async function save() {
      await createCost(description.value, numberValue.value)
      if (!errorCost.value) {
        dialog.value = false
        costsRefetch()
        history(HISTORY_CREATE, `Описание: ${description.value}. Сумма: ${sum.value}`)
        showSuccess('Расходы сохранена!')
        description.value = null
        sum.value = null
      } else {
        showError('Произошла ошибка. Попробуйте позже.')
      }
    }
    
    function remove(cost) {
      $q.dialog({
        title: 'Удалить расход',
        message: 'Вы уверены, что хотите удалить этот расход?',
        cancel: true,
        persistent: true,
        ok: {
          color: 'deep-orange',
          label: 'Удалить',
          push: true
        },
        cancel: {
          color: 'white',
          textColor: 'black',
          label: 'Отмена',
          push: true
        }
      }).onOk(async () => {
        await deleteCost(cost.id)
        if (!deleteError.value) {
          costsRefetch()
          // NOTE: add to history
          showSuccess('Расход успешно удалён!')
        } else {
          showError('Произошла ошибка. Попробуйте позже.')
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
        created_at: moment(c.created_at).local().format(DISPLAY_FORMAT),
      }));
    })

    const costsSum = computed(() => {
      const costs = costsResult.value?.listCosts || []
      const sum = costs.reduce((prev, next) => prev + next.sum, 0)
      return formatPrice(sum)
    })

    return {
      dialog,
      inputRef,
      sum,
      save,
      description,
      openDialog,
      loadingCost,
      columns,
      pagination,
      rows,
      costsLoading,
      loadCosts,
      costsSum,
      CAN_ADD_COST,
      remove,
      deleteLoading
    }
  }
})
</script>
