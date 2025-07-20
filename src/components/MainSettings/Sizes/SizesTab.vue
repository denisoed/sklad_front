<template>
  <div class="sizes-tab">
    <div class="full-width q-pa-xs"
      style="border: 1px solid var(--border-color);border-radius: var(--border-radius)">
      <div class="q-pa-sm q-pt-none">
        <div
          class="flex q-gap-md items-center justify-between q-pb-sm"
          style="border-bottom: 1px solid var(--border-color)"
        >
          <h6 class="q-ma-none text-grey text-subtitle1">Настроить размеры</h6>
          <q-btn color="primary" round @click="openedCrudSizesModal = true" v-vibrate>
            <q-icon name="mdi-plus" />
          </q-btn>
        </div>

        <div class="q-mt-md">
          <div
            v-if="sizes?.length"
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
          <h6 v-else class="full-width text-subtitle1 text-center q-mb-md q-mt-lg">
            <span v-if="loading">
              <q-icon size="sm" name="mdi-loading" class="mdi-spin q-mr-sm " />
              Загрузка...
            </span>
            <div v-else class="flex column">
              <span >
                Список пуст
              </span>
              <p class="q-mb-none text-grey-5 text-caption">Создавайте и управляйте списком размеров под разные товары</p>
            </div>
          </h6>
        </div>
      </div>
    </div>

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
import useSizes from 'src/modules/useSizes'
import useProfile from 'src/modules/useProfile'
import { CREATE_SIZES, UPDATE_SIZES } from 'src/graphql/sizes'

export default defineComponent({
  name: 'SizesTab',
  components: {
    SizeItem,
    CrudSizesModal,
  },
  setup() {
    const selectedSizes = ref(null)
    const openedCrudSizesModal = ref(false)

    const { sizes, fetchSizes, removeSizes } = useSizes()
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
      onFinish,
      onEdit,
      onClose,
      CREATE_SIZES,
      UPDATE_SIZES,
    }
  }
})
</script>
