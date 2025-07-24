<template>
  <div class="sizes-tab flex column q-gap-md">
    <Dropdown title="Настроить размеры">
      <template #icon>
        <q-icon name="mdi-cog" size="sm" class="q-mr-sm" />
      </template>
      <template #body>
        <div class="flex column">
          <div class="flex items-center justify-between q-mb-md">
            <span class="text-subtitle2">Конфигурации размеров</span>
            <q-btn 
              color="primary" 
              round 
              size="sm"
              @click="openedCrudSizesModal = true" 
            >
              <q-icon name="mdi-plus" />
            </q-btn>
          </div>
          
          <div v-if="sizes?.length" class="q-gap-sm flex column">
            <div
              style="border: 1px solid var(--border-color);border-radius: var(--border-radius)"
              class="flex column overflow-hidden"
            >
              <SizeItem
                v-for="(size, i) of sizes"
                :key="i"
                :id="size.id"
                :name="size.name"
                :list="size.list"
                @on-edit="onEdit(size)"
                @on-update="onFinish"
              />
            </div>
          </div>
          <div v-else class="flex column items-center">
            <q-separator class="q-mb-md full-width" />
            <span v-if="loading" class="text-grey-6">
              <q-icon size="sm" name="mdi-loading" class="mdi-spin q-mr-sm" />
              Загрузка...
            </span>
            <div v-else class="flex column items-start text-left">
              <span class="text-subtitle2">Список пуст</span>
              <p class="q-mb-none text-grey-5 text-caption q-mt-xs">
                Создавайте и управляйте списком размеров под разные товары
              </p>
            </div>
          </div>
        </div>
      </template>
    </Dropdown>

    <CrudSizesModal
      :item="selectedSizes"
      :opened="openedCrudSizesModal"
      :create-gql="CREATE_SIZES"
      :update-gql="UPDATE_SIZES"
      :extend-create-params="{ users_permissions_users: profile.id }"
      @close="onClose"
      @remove="removeSizes"
      @finished="onFinish"
      title="размеры"
    />
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  ref,
  onBeforeMount
} from 'vue'
import CrudSizesModal from 'src/components/MainSettings/Sizes/CrudSizesModal.vue'
import SizeItem from 'src/components/MainSettings/Sizes/SizeItem.vue'
import Dropdown from 'src/components/Dropdown/index.vue'
import useSizes from 'src/modules/useSizes'
import useProfile from 'src/modules/useProfile'
import { CREATE_SIZES, UPDATE_SIZES } from 'src/graphql/sizes'

export default defineComponent({
  name: 'SizesTab',
  components: {
    SizeItem,
    CrudSizesModal,
    Dropdown,
  },
  setup() {
    const selectedSizes = ref(null)
    const openedCrudSizesModal = ref(false)

    const { sizes, fetchSizes, removeSizes, loading } = useSizes()
    const { profile } = useProfile()

    function onClose() {
      selectedSizes.value = null
      openedCrudSizesModal.value = false
    }

    function onEdit(item) {
      selectedSizes.value = item 
      openedCrudSizesModal.value = true
    }

    function onFinish() {
      fetchSizes()
    }

    onBeforeMount(() => {
      fetchSizes()
    })

    return {
      openedCrudSizesModal,
      selectedSizes,
      sizes,
      profile,
      removeSizes,
      loading,
      onFinish,
      onEdit,
      onClose,
      CREATE_SIZES,
      UPDATE_SIZES,
    }
  }
})
</script>

<style lang="scss" scoped>
.sizes-tab {
  // Consistent styling with UserTab
}
</style>
