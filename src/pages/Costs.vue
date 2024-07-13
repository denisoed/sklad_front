<template>
  <q-page>
    <div class="container">
      <PageTitle :title="$t('Costs_4')">
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
                :placeholder="$t('Costs_79')"
                class="q-mb-md full-width"
              />
              <p class="full-width text-left text-bold q-mb-none text-subtitle1 q-mb-sm">Сколько потратили?</p>
              <q-input
                ref="inputRef"
                v-model="sum"
                outlined
                :placeholder="$t('Costs_87')"
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
                v-vibrate
              />
              <q-btn
                class="button-size"
                color="primary"
                icon="mdi-check"
                push
                :loading="loadingCost"
                @click="save"
                v-vibrate
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
          v-vibrate
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
import { useI18n } from 'vue-i18n'
import useHelpers from 'src/modules/useHelpers'
import useCosts from 'src/modules/useCosts'
import useMoney from 'src/modules/useMoney'
import useHistory from 'src/modules/useHistory'
import { useCurrencyInput } from 'vue-currency-input'
import TableComp from 'src/components/TableComp.vue'
import PageTitle from 'src/components/PageTitle.vue'
import { DISPLAY_FORMAT, HISTORY_CREATE } from 'src/config'
import { CAN_ADD_COST } from 'src/permissions'

export default defineComponent({
  name: 'CostsPage',
  components: {
    TableComp,
    PageTitle,
  },
  setup() {
    const { t: $t } = useI18n()
    const { showSuccess, showError } = useHelpers()
    const { format } = useMoney()
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
    const columns = [
      {
        name: 'fullname',
        label: $t('Costs_156'),
        field: 'fullname',
        align: 'left',
      },
      {
        name: 'description',
        label: $t('Costs_162'),
        field: 'description',
        align: 'left',
      },
      {
        name: 'sum',
        label: $t('Costs_168'),
        align: 'left',
        field: 'sum',
      },
      {
        name: 'created_at',
        label: $t('Costs_174'),
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
        showSuccess($t('Costs_235'))
        description.value = null
        sum.value = null
      } else {
        showError($t('Costs_239'))
      }
    }
    
    function remove(cost) {
      $q.dialog({
        title: $t('Costs_245'),
        message: $t('Costs_246'),
        cancel: true,
        persistent: true,
        ok: {
          color: 'deep-orange',
          label: $t('Costs_251'),
          push: true
        },
        cancel: {
          color: 'white',
          textColor: 'black',
          label: $t('Costs_257'),
          push: true
        }
      }).onOk(async () => {
        await deleteCost(cost.id)
        if (!deleteError.value) {
          costsRefetch()
          // NOTE: add to history
          showSuccess($t('Costs_265'))
        } else {
          showError($t('Costs_267'))
        }
      })
    }

    const rows = computed(() => {
      const costs = costsResult.value?.listCosts || []
      return costs.map(c => ({
        id: c.id,
        fullname: c?.users_permissions_user?.fullname || 'n/a',
        description: c.description,
        sum: format(c.sum, $t('with')),
        created_at: moment(c.created_at).local().format(DISPLAY_FORMAT),
      }));
    })

    const costsSum = computed(() => {
      const costs = costsResult.value?.listCosts || []
      const sum = costs.reduce((prev, next) => prev + next.sum, 0)
      return format(sum, $t('with'))
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
