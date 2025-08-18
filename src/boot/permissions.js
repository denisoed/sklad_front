import { boot } from 'quasar/wrappers'

export default boot(async ({ app, store, router }) => {
  app.directive('permissions', {
    mounted(el, binding) {
      const profileStore = store.state.value.profile.profile
      const blockPermissions = binding.value?.permissions || binding.value || [];
      if (blockPermissions.length) {
        const skladId = router.currentRoute.value.params?.skladId || binding.value?.skladId;
        if (skladId) {
          const userPermissions = profileStore.permissions?.find(p => p?.sklad?.id === skladId)?.list || [];
          if (blockPermissions.every(bp => !userPermissions?.includes(bp))) {
            el.parentElement.removeChild(el)
          }
        }
      }
    }
  })
})
