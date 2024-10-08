<template>
  <q-page>
    <div class="products container">
      <FiltersComp
        :loading="loadingProducts"
        :autofocus="searchAutofocus"
        @on-search="onSearch"
      />

      <template v-if="skladProducts?.length">
        <p class="q-mb-sm text-subtitle2">Склады</p>
        <MiniTabs
          :list="skladProducts"
          :selected-id="selectedSkladId"
          class="q-mb-md"
          @on-change="onChangeSklad"
        />
      </template>

      <!-- Categories -->
      <p class="q-mb-sm text-subtitle2">Категории</p>
      <MiniTabs
        :list="categories"
        :selected-id="selectedCategoryId"
        class="mini-tabs-categories q-pb-md"
        @on-change="onChangeCategory"
      />

      <template v-if="listProducts?.length">
        <div class="flex items-center justify-between">
          <p class="q-mb-sm text-subtitle2">Товары</p>
          <router-link
            :to="`/sklad/${selectedSkladId}`"
            class="q-mb-sm text-subtitle2 text-underline"
            v-vibrate
          >
            Перейти на склад
          </router-link>
        </div>
        <div>
          <CardProduct
            v-for="(p, i) of listProducts"
            :key="i"
            :id="p.id"
            :name="p.name"
            :orig-price="p.origPrice"
            :new-price="p.newPrice"
            :discount-price="p.discountPrice"
            :discount-days="p.discountDays"
            :with-discount="p.withDiscount"
            :color="p.color"
            :sizes="p.sizes"
            :image="p.image?.url"
            :count-sizes="p.countSizes"
            :sklad="p?.sklad"
            :use-number-of-sizes="p.useNumberOfSizes"
            @open-image-preview="onOpenImagePreview(p.image?.url)"
            class="q-mb-md"
          >
            <div class="flex column full-height">
              <q-btn
                v-permissions="{ permissions: [CAN_UPDATE_PRODUCT], skladId: p?.sklad?.id }"
                round
                push
                size="md"
                class="q-mb-md"
                :to="`/sklad/${p?.sklad?.id}/product/${p.id}`"
                v-vibrate
              >
                <q-icon
                  name="mdi-eye"
                  color="primary"
                />
              </q-btn>
              <div v-permissions="{ permissions: [CAN_SELL_PRODUCT], skladId: p?.sklad?.id }">
                <ModalCountToBucket
                  v-if="p.useNumberOfSizes"
                  :max="p.countSizes"
                  @submit="onAddCountToBucket(p, $event)"
                >
                  <q-btn
                    round
                    push
                    icon="mdi-basket-plus-outline"
                    text-color="deep-orange"
                    v-vibrate
                  />
                </ModalCountToBucket>
                <ModalSizesToBucket
                  v-else
                  :sizes="p.sizes"
                  :type-sizes="p?.typeSize?.list || []"
                  @submit="onAddSizesToBucket(p, $event)"
                >
                  <q-btn
                    round
                    push
                    icon="mdi-basket-plus-outline"
                    text-color="deep-orange"
                    v-vibrate
                  />
                </ModalSizesToBucket>
              </div>
              <q-checkbox
                v-model="bulkProducts"
                :val="p"
                class="q-mt-auto"
              />
            </div>
          </CardProduct>
        </div>
      </template>
      <h6
        v-else
        class="full-width flex column items-center text-center text-grey-5"
      >
        <span
          v-if="loadingProducts"
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
            <q-icon size="sm" name="mdi-basket-outline" class="q-mr-xs text-grey-5" />
            Список пуст
          </span>
          <p class="q-mt-md text-subtitle2 text-grey-5" style="max-width:220px;">
            Не удалось найти товары
          </p>
        </div>
      </h6>
    </div>
    <ProductControls
      :show="Boolean(bulkProducts?.length)"
      :title="`Выбрано: ${bulkProducts?.length}`"
      @on-close="onCloseBulk"
      @on-finish-remove="onFinishRemove"
      @on-finish-update="onFinishUpdate"
    />

    <!-- Dialog -->
    <q-dialog v-model="imagePreviewDialog" position="bottom">
      <q-swipe-to-close
        v-model="imagePreviewDialog"
        direction="down"
      >
        <q-card class="full-width">
          <q-img
            :src="imagePreview"
            spinner-size="md"
            spinner-color="grey"
          />
          <q-btn
            round
            push
            color="deep-orange"
            size="sm"
            v-close-popup
            class="absolute-top-right q-mr-md q-mt-md"
            v-vibrate
          >
            <q-icon
              name="mdi-close"
              color="white"
            />
          </q-btn>
        </q-card>
      </q-swipe-to-close>
    </q-dialog>
  </q-page>
</template>

<script>
import {
  computed,
  defineComponent,
  onBeforeMount,
  ref,
  reactive,
  onMounted
} from 'vue'
import useProfile from 'src/modules/useProfile'
import useSklads from 'src/modules/useSklads'
import useProduct from 'src/modules/useProduct'
import useBucket from 'src/modules/useBucket'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBulkStore } from 'src/stores/bulk';

import CardProduct from 'src/components/CardProduct.vue'
import FiltersComp from 'src/components/FiltersComp.vue'
import ModalSizesToBucket from 'src/components/ModalSizesToBucket.vue'
import ModalCountToBucket from 'src/components/ModalCountToBucket.vue'
import ProductControls from 'src/components/ProductControls.vue'
import MiniTabs from 'src/components/Product/MiniTabs.vue'

const ALL_TAB = {
  id: 0,
  name: 'Все',
  color: '#fff'
}

import {
  CAN_SELL_PRODUCT,
  CAN_UPDATE_PRODUCT
} from 'src/permissions'

export default defineComponent({
  name: 'ProductsPage',
  components: {
    CardProduct,
    FiltersComp,
    ModalSizesToBucket,
    ModalCountToBucket,
    ProductControls,
    MiniTabs
  },
  props: {
    searchAutofocus: {
      type: Boolean,
      deafult: false,
    }
  },
  setup() {
    const bulkStore = useBulkStore();
    const { bulkProducts } = storeToRefs(bulkStore);
    const { params, query } = useRoute()
    const {
      sklad,
      sklads,
      skladProducts,
      fetchSkladProducts,
      isLoading: loadingProducts
    } = useSklads()
    const { profile } = useProfile()
    const { loadBucketProducts } = useBucket()
    const {
      addSizesToBucket,
      addCountToBucket,
    } = useProduct()

    const selectedSkladId = ref(
      params?.skladId ||
        profile.value?.permissions?.map(p => p?.sklad?.id)[0]
    )
    const imagePreviewDialog = ref(false)
    const imagePreview = ref(null)
    const selectedCategoryId = ref(params?.categoryId || ALL_TAB.id)
    const selectedFilters = reactive({})

    const categories = computed(
      () => {
        const categSklad = skladProducts.value.find(sp => sp.id === selectedSkladId.value)
        return [
          ALL_TAB,
          ...(categSklad?.categories?.length > 1 ? categSklad?.categories : [])
        ]
      }
    );
    const listProducts = computed(
      () => {
        const skl = skladProducts.value.find(sp => sp.id === selectedSkladId.value)
        return skl?.products || []
      }
    );

    function fetchSaleProducts() {
      loadBucketProducts(
        null,
        {
          where: {
            sklad: sklads.value?.map(s => s.id)
          }
        },
        { fetchPolicy: 'network-only' }
      );
    }

    async function onAddSizesToBucket(product, payload) {
      await addSizesToBucket(product, payload)
      fetchSaleProducts()
      loadData()
    }

    async function onAddCountToBucket(product, payload) {
      await addCountToBucket(product, payload)
      fetchSaleProducts()
      loadData()
    }

    function onCloseBulk() {
      bulkStore.setBulkProducts([])
    }

    function onFinishUpdate() {
      loadData()
      onCloseBulk()
    }

    async function onFinishRemove() {
      onCloseBulk()
      await loadData()
      await fetchSaleProducts()
    }

    // Scroll to card by id from url and highlight it
    function onScrollToCard() {
      const id = query.product;
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        })
        element.classList.add('highlight')
        setTimeout(() => {
          element.classList.remove('highlight')
        }, 10000)
      }
    }

    async function loadData() {
      const resp = await fetchSkladProducts(
        profile.value.id,
        {
          products: selectedFilters.value
        },
        {
          products: selectedFilters.value
        },
        {
          _or: [
            {
              ...(selectedSkladId.value ? { sklad: selectedSkladId.value } : {}),
              ...(selectedCategoryId.value ? { category: selectedCategoryId.value } : {}),
            },
          ],
          ...selectedFilters.value
        }
      )
      return resp;
    }

    async function onSearch(filters = {}) {
      selectedFilters.value = filters;
      selectedCategoryId.value = ALL_TAB.id;
      selectedSkladId.value = ALL_TAB.id;
      const filtered = await loadData();
      selectedSkladId.value = filtered?.[0]?.id;
    }

    function onChangeSklad(id) {
      selectedSkladId.value = id;
      selectedCategoryId.value = ALL_TAB.id;
      loadData();
    }

    function onChangeCategory(id) {
      selectedCategoryId.value = id;
      loadData();
    }

    function onOpenImagePreview(url) {
      imagePreview.value = url
      imagePreviewDialog.value = true
    }
    
    onBeforeMount(() => {
      loadData();
    })

    onMounted(() => {
      setTimeout(() => {
        onScrollToCard()
      }, 300);
    })

    return {
      loadingProducts,
      onSearch,
      sklad,
      sklads,
      params,
      onAddSizesToBucket,
      onAddCountToBucket,
      CAN_SELL_PRODUCT,
      CAN_UPDATE_PRODUCT,
      onFinishRemove,
      onCloseBulk,
      onFinishUpdate,
      bulkProducts,
      onChangeSklad,
      selectedSkladId,
      categories,
      onChangeCategory,
      selectedCategoryId,
      skladProducts,
      listProducts,
      imagePreviewDialog,
      imagePreview,
      onOpenImagePreview
    }
  }
})
</script>

<style lang="scss" scoped>
.sell-count {
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: normal;
  color: #000;
  font-size: 14px;
  background-color: #fff;
  border-radius: 100%;
  box-shadow: rgba(100, 100, 111, 0.6) 0px 7px 29px 0px;
  position: absolute;
  top: -8px;
  right: -6px;
}

.highlight {
  box-shadow: rgba(var(--q-primary-rgb), 1) 0px 0px 3px 3px;
  animation: fade-out 10s forwards;
}

.products {
  :deep(.small-card_color) {
    display: none;
  }

  :deep(.mini-tabs-categories) {
    .small-card {
      width: auto;
      min-width: 100px;
    }
  }
}

@keyframes fade-out {
  0% {
    box-shadow: rgba(var(--q-primary-rgb), 0.6) 0px 0px 3px 3px;
  }
  100% {
    box-shadow: var(--box-shadow);
  }
}

.slide-down-enter-active {
  transition: all .3s ease;
}
.slide-down-leave-active {
  transition: all .5s ease;
}
.slide-down-enter, .slide-down-leave-to {
  transform: translateY(50px);
  opacity: 0;
}
.slide-down-enter-from {
  transform: translateY(50px);
  opacity: 0;
}

.text-underline {
  text-decoration: underline;
}
</style>
