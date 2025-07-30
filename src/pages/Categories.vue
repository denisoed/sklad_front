<template>
  <q-page>
    <div class="container">
      <PageTitle title="Категории товаров">
        <div>
          <q-card-section class="q-pt-none">
            На этой странице находятся товары разбитые по категориям. Категории обеспечивают более удобный визуальный поиск.
          </q-card-section>
          <q-card-section class="q-pt-none text-primary">
            <p class="text-caption">
              Чтобы удалить или отредактировать категорию, удерживайте её несколько секунд.
            </p>
          </q-card-section>
        </div>
      </PageTitle> 
      <div v-if="list && list?.length" class="categories_cards full-width q-mb-md q-mt-sm">
        <h6
          class="full-width text-center text-grey-5"
          v-if="!list.length"
        >
          <span>
            Категории не найдены!
          </span>
        </h6>
        <router-link
          v-for="(category, i) of list"
          :key="i"
          :to="`categories/${category.id}`"
          class="categories_card block-bg"
          v-touch-hold.mouse="onHold"
          @mousedown="onMouseDown(category)"
          @touchstart="onMouseDown(category)"
          v-ripple
        >
          <div
            class="categories_card-color"
            :style="{
              'background-color': category?.color,
              'color': category?.color === 'white' ? '#000' : '#fff'
            }"
          >
            {{ category?.name?.[0] }}
          </div>
          <div class="categories_card-name">
            {{ category?.name }}
          </div>
          <q-badge
            class="absolute-top-right q-mt-sm q-mr-sm"
            color="deep-orange"
          >
            {{ category?.products?.length }}
          </q-badge>
        </router-link>
      </div>

      <h6
        v-else
        class="full-width text-center text-grey-5"
      >
        <span
          v-if="loading"
        >
          <q-icon
            size="sm"
            name="mdi-loading"
            class="mdi-spin q-mr-sm "
          />
          Загрузка...
        </span>
        <div v-else class="flex column items-center">
          <span>
            <q-icon size="sm" name="mdi-cart-outline" class="q-mr-sm text-grey-5" />
            Список пуст
          </span>
          <p class="q-mt-md text-subtitle2 ">
            Категории помогут разделять товары по группам
          </p>
        </div>
      </h6>
      <div class="flex column items-center q-mt-md">
        <q-btn
          v-permissions="[CAN_ADD_CATEGORY]"
          color="primary"
          push
          :loading="deleteCategoryLoading"
          @click="openedNewCategoryModal = true"
          style="z-index: 2;"
        >
          Добавить категорию
        </q-btn>
      </div>
    </div>

    <CrudModal
      :item="selectedCategory"
      :opened="openedNewCategoryModal"
      :create-gql="CREATE_CATEGORY"
      :update-gql="UPDATE_CATEGORY"
      :extend-create-params="{ sklad: params?.skladId }"
      @close="onCloseModal"
      @remove="onRemove"
      @finished="refetch"
      title="категорию"
    />
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import {
  defineComponent,
  computed,
  ref,
  onBeforeMount
} from 'vue'
import useHelpers from 'src/modules/useHelpers'
import PageTitle from 'src/components/PageTitle.vue'
import CrudModal from 'src/components/Dialogs/CrudModal.vue'
import { useLazyQuery, useMutation } from '@vue/apollo-composable'
import {
  CATEGORIES,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY
} from 'src/graphql/category'
import { useRoute } from 'vue-router'
import { CAN_ADD_CATEGORY } from 'src/permissions'

export default defineComponent({
  name: 'CategoriesPage',
  components: {
    PageTitle,
    CrudModal,
  },
  setup() {
    const $q = useQuasar()
    const { params } = useRoute()
    const { showSuccess, showError } = useHelpers()
    const {
      result,
      loading,
      load,
      refetch
    } = useLazyQuery(CATEGORIES)

    const {
      mutate: deleteCategory,
      loading: deleteCategoryLoading,
      error: deleteCategoryError,
    } = useMutation(DELETE_CATEGORY)

    const selectedCategory = ref(null)
    const openedNewCategoryModal = ref(false)

    const list = computed(
      () => result.value?.categories || []
    );

    function onHold() {
      openedNewCategoryModal.value = true
    }

    function onMouseDown(category) {
      selectedCategory.value = category
    }

    function onCloseModal() {
      openedNewCategoryModal.value = false
      selectedCategory.value = null
    }

    function onRemove(category) {
      $q.dialog({
        title: 'Удалить категорию',
        message: 'Вы уверены, что хотите удалить эту категорию?',
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
      }).onOk(async () => {
        await deleteCategory({ id: category.id })
        if (!deleteCategoryError.value) {
          refetch()
          // NOTE: add to history
          showSuccess('Категория успешно удалёна!')
        } else {
          showError('Произошла ошибка. Попробуйте позже.')
        }
      })
    }

    onBeforeMount(() => {
      load(
        null,
        { where: { sklad: params?.skladId }},
        { fetchPolicy: 'network-only' }
      )
    })

    return {
      list,
      loading,
      openedNewCategoryModal,
      onHold,
      onRemove,
      refetch,
      onCloseModal,
      deleteCategoryLoading,
      onMouseDown,
      selectedCategory,
      CREATE_CATEGORY,
      UPDATE_CATEGORY,
      params,
      CAN_ADD_CATEGORY
    }
  }
})
</script>

<style lang="scss" scoped>
.categories {
    &_cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      @media screen and (max-width: 576px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media screen and (max-width: 350px) {
        grid-template-columns: repeat(1, 1fr);
      }
    }

    &_card {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);

      &-name {
        width: 100%;
        font-size: 16px;
        padding: 2px 4px;
        box-sizing: border-box;
        text-align: center;
        background-color: rgb(0 255 255 / 8%);
      }

      &-color {
        width: 60px;
        height: 60px;
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
