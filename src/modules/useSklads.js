import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import {
  SKLAD,
  SKLADS,
  UPDATE_SKLAD,
  REMOVE_SKLAD,
  BULK_UPDATE_SKLADS,
  SKLAD_PRODUCTS
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
  const { t: $t } = useI18n()
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
        showError($t('useSklads_72'))
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
      showError($t('useSklads_96'))
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSkladProducts(
    userId,
    skladParams = {},
    categoriesParams = {},
    productsParams = {}
  ) {
    try {
      isLoading.value = true;
      const { data } = await apolloClient.query({
        query: SKLAD_PRODUCTS,
        variables: {
          whereSklads: {
            users: userId,
            ...skladParams,
          },
          whereCategories: categoriesParams,
          whereProducts: productsParams
        },
        fetchPolicy: 'network-only'
      })
      skladStore.setSkladProducts(data?.sklads)
      return data?.sklads;
    } catch (error) {
      showError($t('useSklads_125'))
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
      showError($t('useSklads_144'))
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
        showSuccess($t('useSklads_175'))
      } catch (error) {
        showError($t('useSklads_177'))
      } finally {
        isLoading.value = false
      }
    } else {
      showError($t('useSklads_182'))
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
        showSuccess($t('useSklads_202'))
      } catch (error) {
        showError($t('useSklads_204'))
      } finally {
        isLoading.value = false
      }
    } else {
      showError($t('useSklads_209'))
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
        showSuccess($t('useSklads_232'))  
      } catch (error) {
        showError($t('useSklads_234'))
      } finally {
        isLoading.value = false
      }
    } else {
      showError($t('useSklads_239'))
    }
  }

  function removeSklad(skladId, callback) {
    $q.dialog({
      title: $t('useSklads_245'),
      message: $t('useSklads_246'),
      cancel: true,
      persistent: true,
      ok: {
        color: 'deep-orange',
        label: $t('useSklads_251'),
        push: true
      },
      cancel: {
        color: 'white',
        textColor: 'black', 
        label: $t('useSklads_257'),
        push: true,
      }
    }).onOk(async () => {
      await deleteSklad({ skladId });
      if (!removeSkladError.value) {
        showSuccess($t('useSklads_263'))
        callback()
      } else {
        showError($t('useSklads_266'))
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
    fetchSkladProducts,
    bulkUpdateSklads,
    removeSkladLoading,
    removeSklad,
    clearSklad,
    addNewUserToSklad,
    removeUserFromSklad,
    updateUserPermissionInSklad,
    isLoading,
    onCreateNew,
  }
}

export default useSklads
