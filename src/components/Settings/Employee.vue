<template>
  <div class="full-width">
    <div class="flex items-center q-mb-md">
      <h6 class=" text-subtitle1 q-my-none">Участники склада</h6>
      <q-btn
        icon="mdi-plus"
        round
        color="primary"
        class="q-ml-auto"
        @click="openedNewEmployeeModal = true"
      />
    </div>
    <q-table
      :rows="rows"
      :columns="columns"
      :loading="loadingActivities"
      :pagination="pagination"
      row-key="name"
      separator="cell"
      class="statistic-table full-width q-mb-sm"
      hide-pagination
      no-data-label="Люди не добавлены"
    >
      <template #body="props">
        <q-tr :props="props">
          <q-td class="text-left">
            {{ props.row.name }}
          </q-td>
          <q-td class="text-left">
            {{ props.row.email }}
          </q-td>
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

    <NewEmployee
      :user="seletedUser"
      :opened="openedNewEmployeeModal"
      @close="close"
      @create="addNewUserToSklad"
      @update="updateUserPermissionInSklad"
    />
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  toRefs,
  ref
} from 'vue'
import { useQuasar } from 'quasar'
import useSklads from 'src/modules/useSklads'
import NewEmployee from 'src/components/Settings/NewEmployee.vue'

export default defineComponent({
  name: 'EmployeeSettings',
  components: {
    NewEmployee
  },
  props: {
    users: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
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
          label: 'Имя',
          align: 'left',
          field: 'name'
        },
        {
          name: 'telegramId',
          label: 'Telegram ID',
          align: 'left',
          field: 'telegramId'
        },
        {
          name: 'email',
          label: 'Почта',
          align: 'left',
          field: 'email'
        },
        {
          name: 'action',
          label: 'Действия',
          align: 'right',
          field: 'action'
        },
      ]
    })

    function remove(user) {
      $q.dialog({
        title: `Удалить ${user.name} из склада?`,
        message: 'После удаления человека из склада, он больше не будет иметь доступ к складу.',
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

    return {
      columns,
      rows,
      remove,
      update,
      close,
      seletedUser,
      openedNewEmployeeModal,
      addNewUserToSklad,
      updateUserPermissionInSklad
    }
  }
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
