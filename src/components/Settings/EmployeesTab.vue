<template>
  <div class="full-width">
    <TheDropdown
      class="full-width"
      :title="$t('warehouse.participants')"
      opened
    >
      <template #icon>
        <q-icon name="mdi-account-group" size="sm" class="q-mr-sm" />
      </template>
      <template #body>
        <div class="flex items-center q-mb-md">
          <h6 class=" text-subtitle1 q-my-none">{{ $t('warehouse.addParticipant') }}</h6>
          <q-btn
            icon="mdi-plus"
            round
            size="sm"
            color="primary"
            class="q-ml-auto"
            @click="openedNewEmployeeModal = true"
          />
        </div>
        <q-table
          v-if="users?.length"
          :rows="users"
          :columns="columns"
          row-key="id"
          flat
          :rows-per-page-options="[0]"
          hide-pagination
          class="block-bg border-radius-sm"
        >
          <template #body="props">
            <q-tr :props="props">
              <q-td class="text-left">
                {{ props.row.name }}
              </q-td>
              <!-- <q-td class="text-left">
                {{ props.row.email }}
              </q-td> -->
              <q-td class="text-left">
                {{ props.row.telegramId }}
              </q-td>
              <q-td class="text-right">
                <q-btn
                  icon="mdi-pencil"
                  round
                  size="sm"
                  color="primary"
                  class="q-mr-md"
                  @click="update(props.row)"
                />
                <q-btn
                  icon="mdi-trash-can-outline"
                  round
                  size="sm"
                  @click="remove(props.row)"
                  color="deep-orange"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
    
        <div v-else class="flex flex-center full-width full-height">
          <q-separator class="full-width q-mb-md" />
          <div class="text-subtitle1 text-grey-5">
            {{ $t('common.listEmpty') }}
          </div>
        </div>
      </template>
    </TheDropdown>

    <NewEmployee
      :user="seletedUser"
      :opened="openedNewEmployeeModal"
      @close="close"
      @create="addNewUserToSklad"
      @update="updateUserPermissionInSklad"
    />
  </div>
</template>

<script setup>
import {
  computed,
  toRefs,
  ref
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import useSklads from 'src/modules/useSklads'
import NewEmployee from 'src/components/Settings/NewEmployee.vue'
import TheDropdown from 'src/components/TheDropdown/TheDropdown.vue'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  }
})

const { t: $t } = useI18n()
const $q = useQuasar()
const { users } = toRefs(props)
const {
  addNewUserToSklad,
  removeUserFromSklad,
  updateUserPermissionInSklad
} = useSklads()

const seletedUser = ref(null)
const openedNewEmployeeModal = ref(false)

const columns = computed(() => {
  return [
    {
      name: 'name',
      label: $t('common.name'),
      align: 'left',
      field: 'name'
    },
    {
      name: 'telegramId',
      label: 'Telegram ID',
      align: 'left',
      field: 'telegramId'
    },
    // {
    //   name: 'email',
    //   label: 'Почта',
    //   align: 'left',
    //   field: 'email'
    // },
    {
      name: 'action',
      label: $t('common.actions'),
      align: 'right',
      field: 'action'
    },
  ]
})

function remove(user) {
  $q.dialog({
    title: $t('settings.employee.removeEmployee'),
    message: $t('settings.employee.removeDescription'),
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
  }).onOk(() => {
    removeUserFromSklad(user)
  })
}

function update(user) {
  seletedUser.value = user
  openedNewEmployeeModal.value = true
}

function close() {
  seletedUser.value = null
  openedNewEmployeeModal.value = false
}

const rows = computed(() => {
  return users.value.map(f => ({
    id: f.id,
    name: f.fullname,
    telegramId: f.telegramId,
    email: f.email,
    permissions: f.permissions
  }));
})
</script>

<style lang="scss">
  .statistic {
    &-table {
      .q-table__top,
      thead tr:first-child th {
        font-weight: bold;
      }
    }
  }
</style>
