<template>
  <q-page
    class="flex justify-center items-center"
  >
    <div class="column q-pa-md">
      <div class="row">
        <q-card style="box-shadow:var(--box-shadow);width:100%;max-width:346px;">
          <q-card-section class="flex items-center bg-primary">
            <h4 class="text-h6 text-white q-my-none">Авторизация</h4>
          </q-card-section>
          <q-card-section v-if="!error">
            <div class="flex items-center">
              <q-spinner color="primary" size="sm" class="q-mr-md" />
              <p class="q-ma-none">
                Ожидайте окончания авторизации...
              </p>
            </div>
          </q-card-section>
          <q-card-section v-else>
            <div class="flex items-center">
              <p class="text-deep-orange text-bold q-mb-sm">
                Произошла ошибка :(
              </p>
              <p>Не удалось получить ключ авторизации.</p>
              <div class="full-width flex items-center q-mt-sm">
                Попробуйте еще раз
                <q-btn push color="primary" icon="mdi-repeat" class="q-ml-auto" to="/auth" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import useJwtMethods from 'src/modules/auth/useJwtMethods'
import useHelpers from 'src/modules/useHelpers'

export default defineComponent({
  name: 'ConnectGoogle',
  setup() {
    const { query } = useRoute()
    const { connect } = useJwtMethods()
    const {
      showSuccess,
      showError,
    } = useHelpers()

    const error = ref(false)
    const access_token = ref(query?.access_token)

    onBeforeMount(async () => {
      // Register new user by google mail
      if (access_token.value) {
        try {
          const url = `/auth/google/callback?access_token=${access_token.value}`
          await connect(url)
          showSuccess('Вы вошли в систему')
          window.location.href = window.location.origin
        } catch {
          error.value = true
          showError('Не удалось получить ключ авторизации')
        }
      } else {
        error.value = true
        showError('Не удалось получить ключ авторизации')
      }
    })

    return {
      error
    }
  }
})
</script>