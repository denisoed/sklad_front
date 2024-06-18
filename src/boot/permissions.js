import { boot } from 'quasar/wrappers'
import { useProfileStore } from 'src/stores/profile'

export default boot(async ({ app, router }) => {
  app.directive('permissions', {
    mounted(el, binding) {
      const profileStore = useProfileStore()
      const blockPermissions = binding.value?.permissions || binding.value || [];
      if (blockPermissions.length) {
        const skladId = router.currentRoute.value.params?.skladId || binding.value?.skladId;
        if (skladId) {
          const userPermissions = profileStore.getProfile?.permissions?.find(p => p?.sklad?.id === skladId)?.list || [];
          if (blockPermissions.every(bp => !userPermissions?.includes(bp))) {
            el.parentElement.removeChild(el)
          }
        }
      }
    }
  })
})
