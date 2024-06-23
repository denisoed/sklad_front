<template>
  <q-dialog
    :model-value="opened"
    position="bottom"
    @update:model-value="close"
  >
    <q-card style="width: 350px" class="new-employee">
      <q-card-section class="flex no-wrap column row items-center no-wrap q-pa-none q-pb-xl">
        <div class="flex justify-center full-width">
          <div class="q-px-md q-pt-md q-pb-sm full-width new-employee_field">
            <q-input
              outlined
              color="primary"
              class="full-width"
              debounce="500"
              hint="Сотрудник, к которому будут присвоины полномочия"
              placeholder="Введите телеграмм ID"
              enterkeyhint="done"
              dense
              :model-value="formData.telegramId"
              @update:model-value="findUser"
              :readonly="!!user"
              :loading="loadingUsers"
            >
              <template #append v-if="!loadingUsers">
                <q-icon v-if="isValidEmail" name="check" class="text-green" />
                <q-icon v-else name="search" />
              </template>
      
              <q-menu v-if="formData.telegramId" fit no-focus v-model="menu">
                <q-list style="min-width: 100px">
                  <q-item clickable v-close-popup v-for="(u, i) of users" :key="i" @click="selectUser(u)">
                    <q-item-section>{{ u.fullname || u.telegramId }}</q-item-section>
                  </q-item>              
                </q-list>
              </q-menu>
            </q-input>
          </div>
          <div class="new-employee_checkboxes q-px-sm q-pb-md">
            <!-- <q-checkbox v-model="allPermissions" label="Дать все права" />
            <q-separator /> -->
            <q-checkbox
              v-for="(p, i) of listPermissions"
              :key="i"
              v-model="formData.permissions"
              :val="p.val"
              :label="p.label"
              color="primary"
              class="full-width"
            />
          </div>
          <div class="flex column q-px-md full-width q-gap-md">
            <q-separator class="full-width" />
            <div class="flex justify-between no-wrap q-gap-md full-width">
              <q-btn
                class="button-size"
                color="grey"
                icon="mdi-close"
                push
                @click="close"
                v-vibrate
              />
              <q-btn
                class="button-size"
                color="primary"
                icon="mdi-check"
                push
                :disabled="!isValidEmail"
                @click="submit"
                v-vibrate
              />
            </div>
          </div>
        </div>
      </q-card-section>
      <q-inner-loading :showing="isLoading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script>
import {
  computed,
  defineComponent,
  reactive,
  toRefs,
  watch,
  ref
} from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'
import {
  USERS
} from 'src/graphql/types'
import useSklads from 'src/modules/useSklads'
import { ALL_PERMISSIONS_WITH_DESCRIPTION } from 'src/permissions'

export default defineComponent({
  name: 'NewEmployee',
  props: {
    opened: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      defailt: null
    }
  },
  emits: ['close', 'save', 'on-create-new'],
  setup(props, { emit }) {
    const {
      user,
      opened
    } = toRefs(props)
    const { sklad } = useSklads()

    const formData = reactive({
      id: null,
      telegramId: null,
      permissions: [],
      oldPermissions: [],
    })
    
    const menu = ref(false)
    const allPermissions = ref(false)
    const isValidEmail = ref(false)

    const {
      load: loadUsers,
      result: resultUsers,
      loading: loadingUsers,
    } = useLazyQuery(USERS)

    function reset() {
      formData.id = null
      formData.telegramId = null
      formData.permissions = []
      formData.oldPermissions = []
      isValidEmail.value = false
    }

    function close() {
      emit('close')
    }

    function submit() {
      const action = user.value ? 'update' : 'create'
      emit(action, formData)
      close()
    }

    function selectUser(user) {
      isValidEmail.value = true
      formData.id = user?.id
      formData.telegramId = user?.telegramId
      formData.oldPermissions = user?.permissions || []
      menu.value = false
    }

    async function findUser(val) {
      isValidEmail.value = false
      formData.telegramId = val
      menu.value = true
      loadUsers(
        null,
        { where: { telegramId_contains: val, id_ne: sklad.value?.owner?.id }},
        { fetchPolicy: 'network-only' }
      )
    }

    watch(user, (newVal) => {
      if (newVal) {
        selectUser(newVal)
        const skladPermissions = newVal.permissions.find(p => p.sklad.id === sklad.value?.id)
        formData.permissions = skladPermissions?.list || []
      }
    })

    watch(opened, (newVal) => {
      if (!newVal) {
        findUser()
      }
    })

    const listPermissions = computed(() => {
      return ALL_PERMISSIONS_WITH_DESCRIPTION.map(p => ({
        val: p.val,
        label: p.description,
      }))
    })

    const users = computed(() => resultUsers.value?.users || [])

    return {
      close,
      submit,
      formData,
      listPermissions,
      menu,
      loadingUsers,
      users,
      findUser,
      selectUser,
      isValidEmail,
      allPermissions
    }
  }
})
</script>

<style lang="scss" scoped>
.new-employee {
  &_field {
    position: sticky;
    top: 0;
    background: var(--q-dark);
    z-index: 1;
  }

  &_checkboxes {
    max-height: 300px;
    overflow-y: auto;
  }
}
</style>