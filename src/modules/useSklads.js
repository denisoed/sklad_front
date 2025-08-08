import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import {
  SKLAD,
  SKLADS,
  UPDATE_SKLAD,
  REMOVE_SKLAD,
  BULK_UPDATE_SKLADS
} from 'src/graphql/sklads'
import { apolloClient } from 'src/boot/apollo'
import { useMutation } from '@vue/apollo-composable'
import { useSkladsStore } from 'src/stores/sklads'
import { useRoute, useRouter } from 'vue-router'
import useHelpers from 'src/modules/useHelpers'
import useProfile from 'src/modules/useProfile'
import { HOME_ROUTE } from 'src/router/routes'
import { ALL_PERMISSIONS } from 'src/permissions'

const IGNORE_PAGE_TO_REPLACE = []

const useSklads = () => {
  const $q = useQuasar()
  const route = useRoute()
  const { replace } = useRouter()
  const { updateUser, profile, fetchProfile } = useProfile()
  const { showError, showSuccess } = useHelpers()
  const skladStore = useSkladsStore()

  const sklad = computed(() => skladStore.getSklad)
  const skladProducts = computed(() => skladStore.skladProducts)
  const sklads = computed({
    get() {
      const list = skladStore.getSklads || []
      return list.slice().sort((a, b) => a?.order - b?.order);
    },
    set(newSklads) {
      const newList = newSklads.map((item, i) => {
        return {
          ...item,
          order: i
        };
      });
      skladStore.setSklads(newList)
      bulkUpdateSklads(newList)
    },
  })

  const {
    error: removeSkladError,
    loading: removeSkladLoading,
    mutate: deleteSklad
  } = useMutation(REMOVE_SKLAD)

  const isLoading = ref(false)

  function clearSklad() {
    skladStore.setSklad(null)
  }

  async function fetchSklad(id) {
    const skladId = +(id || route.params?.skladId)
    if (skladId) {
      try {
        const { data } = await apolloClient.query({
          query: SKLAD,
          variables: { id: skladId },
          fetchPolicy: 'network-only'
        })
        skladStore.setSklad(data?.sklad)
      } catch (error) {;
        showError('Неизвестная ошибка. Перегрузите приложение!')
      }
    } else {
      clearSklad()
      if (!IGNORE_PAGE_TO_REPLACE.some(p => window.location.hash.includes(p))) {
        replace(HOME_ROUTE)
      }
    }
  }

  async function fetchSklads(userId) {
    try {
      isLoading.value = true;
      const { data } = await apolloClient.query({
        query: SKLADS,
        variables: {
          where: {
            users: userId
          }
        },
        fetchPolicy: 'network-only'
      })
      skladStore.setSklads(data?.sklads)
    } catch (error) {
      showError('Неизвестная ошибка. Перегрузите приложение!')
    } finally {
      isLoading.value = false;
    }
  }

  async function bulkUpdateSklads(sklads) {
    try {
      isLoading.value = true;
      await apolloClient.mutate({
        mutation: BULK_UPDATE_SKLADS,
        variables: {
          sklads: sklads.map(s => ({
            id: s.id,
            order: s.order
          })),
        }
      })
    } catch (error) {
      showError('Неизвестная ошибка. Перегрузите приложение!')
    } finally {
      isLoading.value = false;
    }
  }

  async function addNewUserToSklad(payload) {
    if (payload?.id) {
      try {
        isLoading.value = true
        const currentUsers = sklad.value.users.map(u => u.id)
        await apolloClient.mutate({
          mutation: UPDATE_SKLAD,
          variables: {
            id: sklad.value?.id,
            data: {
              users: [payload.id, ...currentUsers]
            }
          }
        })
        const currentPermissions = payload?.oldPermissions?.map(p => ({ sklad: p?.sklad?.id, list: p.list  }))
        await updateUser(payload.id, {
          permissions: [
            ...currentPermissions,
            {
              sklad: sklad.value?.id,
              list: payload.permissions
            }
          ]
        });
        fetchSklad()
        showSuccess('Список участников обновлен!')
      } catch (error) {
        showError('Неизвестная ошибка. Перегрузите приложение!')
      } finally {
        isLoading.value = false
      }
    } else {
      showError('Перезагрузите страницу, попробуйте еще раз!')
    }
  }

  async function updateUserPermissionInSklad(payload) {
    if (payload?.id) {
      try {
        isLoading.value = true
        const filteredPermissions = payload?.oldPermissions?.filter(op => op?.sklad?.id !== sklad.value?.id)
        const formattedPermissions = filteredPermissions.map(fp => ({ list: fp.list, sklad: fp.sklad.id }))
        await updateUser(payload.id, {
          permissions: [
            ...formattedPermissions,
            {
              sklad: sklad.value?.id,
              list: payload.permissions
            }
          ]
        });
        fetchSklad()
        showSuccess('Полномочия обновлены!')
      } catch (error) {
        showError('Неизвестная ошибка. Перегрузите приложение!')
      } finally {
        isLoading.value = false
      }
    } else {
      showError('Перезагрузите страницу, попробуйте еще раз!')
    }
  }

  async function removeUserFromSklad(user) {
    if (user?.id) {
      try {
        isLoading.value = true
        const users = sklad.value.users.filter(u => u.id !== user.id)
        await apolloClient.mutate({
          mutation: UPDATE_SKLAD,
          variables: {
            id: sklad.value?.id,
            data: {
              users: users.map(u => u?.id)
            }
          }
        })
        const permissions = user?.permissions?.filter(p => p.sklad.id !== sklad.value?.id)
        await updateUser(user.id, {
          permissions: permissions?.map(p => ({ sklad: p.sklad.id, list: p.list  }))
        });
        fetchSklad()
        showSuccess('Список участников обновлен!')  
      } catch (error) {
        showError('Неизвестная ошибка. Перегрузите приложение!')
      } finally {
        isLoading.value = false
      }
    } else {
      showError('Перезагрузите страницу, попробуйте еще раз!')
    }
  }

  function removeSklad(skladId, callback) {
    $q.dialog({
      title: 'Удалить склад?',
      message: 'При удалении склада, вся информация о нём будет удалена навсегда. Вы уверены?',
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
        push: true,
      }
    }).onOk(async () => {
      await deleteSklad({ skladId });
      if (!removeSkladError.value) {
        showSuccess('Склад успешно удалён!')
        callback()
      } else {
        showError('Неизвестная ошибка. Проблемы на сервере.')
      }
    })
  }

  async function onCreateNew(payload) {
    await fetchProfile();
    const skladId = payload?.createSklad?.sklad?.id;
    const currentPermissions = profile.value?.permissions?.map(p => ({ sklad: p?.sklad?.id, list: p?.list }));
    await updateUser(profile.value.id, {
      permissions: [
        ...(currentPermissions?.length && currentPermissions || []),
        {
          sklad: skladId,
          list: ALL_PERMISSIONS
        }
      ]
    });
    fetchProfile();
  }

  return {
    sklad,
    sklads,
    skladProducts,
    fetchSklad,
    fetchSklads,
    bulkUpdateSklads,
    removeSkladLoading,
    removeSklad,
    removeSkladError,
    clearSklad,
    addNewUserToSklad,
    removeUserFromSklad,
    updateUserPermissionInSklad,
    isLoading,
    onCreateNew,
  }
}

export default useSklads
