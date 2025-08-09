<template>
  <q-dialog
    :model-value="opened"
    position="bottom"
    @update:model-value="close"
  >
    <SwipeToClose
      direction="down"
      @on-close="close"
    >
      <q-card class="new-employee">
        <div class="dialog-close" id="dialog-close">
          <div class="dialog-close-line" />
        </div>
        <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
        <div class="flex justify-center full-width">
          <div class="q-px-md q-pt-md q-pb-sm full-width new-employee_field">
            <q-input
              outlined
              color="primary"
              class="full-width"
              debounce="500"
              :hint="$t('settings.employee.hint')"
              :placeholder="$t('settings.employee.placeholder')"
              enterkeyhint="done"
              dense
              :model-value="formData.telegramId"
              @update:model-value="findUser"
              :readonly="!!user"
              :loading="loadingUsers"
            >
              <template #append v-if="!loadingUsers">
                <q-icon v-if="hasUser" name="check" class="text-primary" />
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
            <q-checkbox
              :model-value="selectedPermissions"
              @update:model-value="selectAllPermissions"
            >
              <span class="text-bold">
                {{ selectedPermissions ? 'Снять все права' : 'Дать все права' }}
              </span>
            </q-checkbox>
            <q-separator />
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
              />
              <q-btn
                class="button-size"
                color="primary"
                icon="mdi-check"
                push
                :disabled="!hasUser"
                @click="submit"
              />
            </div>
          </div>
        </div>
      </q-card-section>
      <q-inner-loading :showing="isLoading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import {
  computed,
  reactive,
  toRefs,
  watch,
  ref,
  defineComponent
} from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'
import { useI18n } from 'vue-i18n'
import {
  USERS
} from 'src/graphql/types'
import useSklads from 'src/modules/useSklads'
import useProfile from 'src/modules/useProfile'
import { ALL_PERMISSIONS_WITH_DESCRIPTION } from 'src/permissions'
import SwipeToClose from 'src/components/SwipeToClose.vue'

const props = defineProps({
  opened: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    defailt: null
  }
})
const emit = defineEmits(['close', 'save', 'on-create-new'])

const {
  user,
  opened
} = toRefs(props)
const { sklad } = useSklads()
const { profile } = useProfile()
const { t: $t } = useI18n()

const formData = reactive({
  id: null,
  telegramId: null,
  email: null,
  permissions: [],
  oldPermissions: [],
})

const menu = ref(false)
const selectedPermissions = ref(false)
const hasUser = ref(false)

const {
  load: loadUsers,
  result: resultUsers,
  loading: loadingUsers,
} = useLazyQuery(USERS)

function reset() {
  formData.id = null
  formData.telegramId = null
  formData.email = null
  formData.permissions = []
  formData.oldPermissions = []
  hasUser.value = false
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
  hasUser.value = true
  formData.id = user?.id
  formData.telegramId = user?.telegramId
  formData.email = user?.email
  formData.oldPermissions = user?.permissions || []
  menu.value = false
}

async function findUser(val) {
  hasUser.value = false
  formData.telegramId = val
  menu.value = true
  loadUsers(
    null,
    {
      where: {
        _or: [
          { telegramId_contains: val },
        ],
        id_nin: [sklad.value?.owner?.id, profile.value?.id]
      }
    },
    { fetchPolicy: 'network-only' }
  )
}

function selectAllPermissions() {
  selectedPermissions.value = !selectedPermissions.value
  formData.permissions = selectedPermissions.value ? ALL_PERMISSIONS_WITH_DESCRIPTION.map(p => p.val) : []
}

watch(user, (newVal) => {
  if (newVal) {
    selectUser(newVal)
    const skladPermissions = newVal.permissions.find(p => p.sklad.id === sklad.value?.id)
    formData.permissions = skladPermissions?.list || []
    selectedPermissions.value = formData.permissions.length > 0
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
</script>

<style lang="scss" scoped>
.new-employee {
  &_field {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  &_checkboxes {
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>