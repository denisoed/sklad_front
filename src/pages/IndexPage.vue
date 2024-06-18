<template>
  <q-page>
    <q-drawer
      v-model="drawerModel"
      :width="300"
      class="text-white"
    >
      <DrawerMenu />
    </q-drawer>
    <Header
      @toggle-menu="drawerModel = !drawerModel"
      :histories="historyResult"
    />
    <div class="sklads q-mt-lg">
      <div class="sklads_cards" :class="{ 'sklads_cards--much': sklads?.length > 1 }">
        <Draggable
          v-if="sklads?.length"
          handle=".sklads_card-drag"
          class="flex no-wrap q-gap-md"
          v-model="sklads"
          item-key="id"
          :drag="false"
        >
          <template #item="{ element }">
            <div
              :key="i"
              @click="push(`/sklad/${element.id}`)"
              class="sklads_card block-bg"
              v-ripple
            >
              <div class="sklads_card-drag" />
              <div
                class="sklads_card-color"
                :style="{
                  'background-color': element?.color,
                  'color': element?.color?.toLowerCase()?.includes('fff') ? '#000' : '#fff'
                }"
              >
                {{ element?.name?.[0] }}
              </div>
              <div class="sklads_card-name">
                {{ element?.name }}
              </div>
            </div>
          </template>
        </Draggable>
        <div
          v-ripple
          @click="openedNewSkladModal = true"
          class="sklads_add flex column items-center justify-center cursor-pointer text-grey"
          :style="[!sklads?.length && 'width: 100%']"
        >
          <q-icon name="mdi-plus" size="sm" />
          <span>Создать склад</span>
        </div>
      </div>
    </div>

    <SkladsStatistics :ids="skladsIDs" />

    <CrudModal
      :opened="openedNewSkladModal"
      :create-gql="CREATE_SKLAD"
      :update-gql="UPDATE_SKLAD"
      :extend-create-params="{ users: profile?.id }"
      @close="onCloseModal"
      @finished="refetchSklads"
      @on-create-new="onCreateNew"
      title="склад"
    />
  </q-page>
</template>

<script>
import {
  defineComponent,
  computed,
  ref,
  watch
} from 'vue'
import CrudModal from 'src/components/CrudModal.vue'
import { useRouter } from 'vue-router'
import DrawerMenu from 'src/components/DrawerMenu.vue'
import Header from 'src/components/Header.vue'
import {
  CREATE_SKLAD,
  UPDATE_SKLAD
} from 'src/graphql/sklads'
import useSklads from 'src/modules/useSklads'
import useHistory from 'src/modules/useHistory'
import useProfile from 'src/modules/useProfile'
import SkladsStatistics from 'src/components/Sklads/Statistics.vue'
import Draggable from 'vuedraggable'

export default defineComponent({
  name: 'skladsPage',
  components: {
    CrudModal,
    SkladsStatistics,
    Draggable,
    DrawerMenu,
    Header
  },
  setup() {
    const { push } = useRouter()

    const { fetchHistory, lastViewed, historyResult } = useHistory()
    const { profile, subscrHasExpired } = useProfile()
    const { fetchSklads, sklads, onCreateNew } = useSklads()
    const openedNewSkladModal = ref(false)
    const drawerModel = ref(false)

    const skladsIDs = computed(
      () => sklads.value.map(s => s.id) || []
    );

    function onCloseModal() {
      openedNewSkladModal.value = false
    }

    function refresh(done) {
      window.location.reload()
      done()
    }

    function refetchSklads() {
      fetchSklads(profile.value.id)
    }

    watch(sklads, (newValue) => {
      if (newValue) {
        const ids = newValue?.map(s => s.id)
        if (ids?.length) {
          fetchHistory({ sklad: ids, created_at_gte: lastViewed })
        }
      }
    }, {
      immediate: true
    })

    return {
      sklads,
      profile,
      openedNewSkladModal,
      onCloseModal,
      refetchSklads,
      CREATE_SKLAD,
      UPDATE_SKLAD,
      onCreateNew,
      subscrHasExpired,
      skladsIDs,
      refresh,
      push,
      drawerModel,
      historyResult
    }
  }
})
</script>

<style lang="scss" scoped>
.q-page {
  padding-top: 0 !important;
}

.sklads {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;

  &_header {
    box-shadow: 0px 17px 21px -8px rgba(0,0,0,0.15);
    padding: 12px 16px;
    border-bottom-left-radius: 30px;
    border-bottom-right-radius: 30px;
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--main-bg);
  }

  &_add {
    position: relative;
    width: 100%;
    min-width: 140px;
    height: 112px;
    border-radius: var(--border-radius);
    border: 2px dashed var(--border-color);
  }
  
  &_cards {
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    gap: 15px;
    padding: 0 16px 10px;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    &--much {
      width: 100%;
      position: relative;
      overflow-x: auto;
    }

  }
  :deep(.sortable-drag) {
    opacity: 0.2;
  }
  
  &_card {
    width: 140px;
    min-width: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    overflow: hidden;
    cursor: pointer;

    &-drag {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 20px;
    }

    &-name {
      position: relative;
      width: 100%;
      font-size: 14px;
      padding: 4px;
      box-sizing: border-box;
      text-align: center;
      user-select: none;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0.2;
        width: 100%;
        height: 100%;
        background-color: var(--q-primary);
      }
    }
    
    &-color {
      width: 60px;
      height: 60px;
      user-select: none;
      background-color: red;
      border-radius: 100%;
      margin: 12px 0;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 24px;
      color: #fff;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 3px 9px 0px;
    }
  }
}
</style>
