<template>
  <q-page
    class="flex justify-center items-center"
  >
    <div class="column q-pa-md">
      <div class="row">
        <q-card style="box-shadow:var(--box-shadow);width:100%;max-width:346px;" class="border-radius-md">
          <q-card-section class="bg-deep-orange">
            <h4 class="text-h6 text-white q-my-none">{{ title }}</h4>
          </q-card-section>
          <q-card-section>
            <h6 class="q-my-sm">{{ $t('blocked.trialExpired') }}</h6>
            <p>{{ $t('blocked.unlockAccount') }}</p>
          </q-card-section>
          <q-card-actions class="q-px-md q-pb-lg">
            <q-btn
              unelevated
              push
              color="primary"
              @click="submit"
              class="full-width text-white"
              :label="btnLabel"
              tabindex="3"
              :loading="isLoading"
            ></q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import useHelpers from 'src/modules/useHelpers'
import { useRouter } from 'vue-router'
import { HOME_ROUTE } from 'src/router/routes'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'Blocked'
})

const { t: $t } = useI18n()
const btnLabel = computed(() => $t('blocked.checkout'))

const title = $t('blocked.subscriptionExpired')
const isLoading = ref(false)

const { push } = useRouter()
const { showSuccess } = useHelpers()

async function submit() {
  try {
    isLoading.value = true
    showSuccess($t('blocked.subscriptionIssued'))
    push(HOME_ROUTE)
  } finally {
    isLoading.value = false
  }
}
</script>
