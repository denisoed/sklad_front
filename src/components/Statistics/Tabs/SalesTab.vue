<template>
  <div class="sales-tab flex column q-gap-md">
    <StatisticTable
      :list-activities="listActivities"
      :loading-activities="loadingActivities"
      :sold-count="soldCount"
      :orig-price-total="formatPrice(origPriceTotal)"
      :new-price-total="formatPrice(newPriceTotal)"
      :discount-total="discountTotal"
      @return-product="returnProduct"
    />
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import useMoney from 'src/modules/useMoney'
import useHistory from 'src/modules/useHistory'
import useHelpers from 'src/modules/useHelpers'
import StatisticTable from 'src/components/StatisticTable.vue'
import { useMutation } from '@vue/apollo-composable'
import useStatistics from 'src/modules/useStatistics'
import useProfile from 'src/modules/useProfile'
import useActivity from 'src/modules/useActivity'
import {
  UPDATE_PRODUCT
} from 'src/graphql/types'
import {
  DELETE_ACTIVITY
} from 'src/graphql/activity'
import {
  HISTORY_RETURN
} from 'src/config'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'SalesTab'
})

const emit = defineEmits(['on-return-product'])

const { t: $t } = useI18n()
const $q = useQuasar()
const { profile } = useProfile()

const {
  mutate: updateProduct,
  error: updateProductError,
} = useMutation(UPDATE_PRODUCT)

const {
  mutate: deleteActivity,
  error: deleteActivityError,
} = useMutation(DELETE_ACTIVITY)

const {
  createHistory,
} = useHistory()
const { showSuccess, showError } = useHelpers()
const { listActivities, loadingActivities } = useActivity()
const {
  soldCount,
  origPriceTotal,
  newPriceTotal,
  discountTotal
} = useStatistics()

const { formatPrice } = useMoney()

async function remove(activity) {
  try {
    const currentSizes = activity.product.sizes.map(s => ({ size: s.size }));
    const activitySizes = (activity.size?.split(', '))?.map(size => ({ size })) || [];
    await updateProduct({
      id: activity.product.id,
      data: {
        sizes: [...currentSizes, ...activitySizes],
        countSizes: activity.product.countSizes + activity.countSizes
      }
    })
    if (!updateProductError.value) {
      await deleteActivity({
        id: activity.id
      });
      if (!deleteActivityError.value) {
        emit('on-return-product', activity)
        createHistory({
          userId: +profile.value?.id || null,
          productId: +activity?.product?.id || null,
          skladId: +activity?.product?.sklad?.id || null,
          telegramId: +profile.value?.telegramId || null,
          skladName: activity?.product?.sklad?.name || null,
          fullname: profile.value?.fullname,
          email: profile.value?.email,
          json: {
            sizes: activity.size?.length ? [activity.size] : [],
            countSizes: activity.countSizes
          },
          action: HISTORY_RETURN
        })
        showSuccess($t('statistics.sizesReturned'))
      }
    } else {
      showError($t('statistics.returnError'))
    }
  } catch (error) {
    showError($t('statistics.returnError'))
  }
}

function returnProduct(activity) {
  $q.dialog({
    title: $t('statistics.returnToWarehouse'),
    message: $t('statistics.returnConfirm'),
    cancel: true,
    persistent: true,
    ok: {
      color: 'deep-orange',
      label: $t('statistics.return'),
      push: true
    },
    cancel: {
      color: 'grey',
      textColor: 'white',
      label: $t('common.cancel'),
      push: true
    }
  }).onOk(() => {
    remove(activity);
  })
}
</script>
