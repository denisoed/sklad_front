<template>
  <q-page class="flex column items-center q-pa-md q-pt-lg q-pb-xl">
    <div
      :class="{ 'q-pb-xl': bulkProducts?.length }"
      class="flex column"
      style="width: 100%; max-width: 500px;"
    >
      <PageTitle title="Остатки">
        <q-card-section class="q-pt-none">
          На этой странице будут отображаться товары у которых осталось мало размеров.<br />Это можно регулировать в настройках, в разделе "Размеры"
        </q-card-section>
      </PageTitle>
      <div v-if="products?.length">
        <CardProduct
          v-for="(p, i) of products"
          :key="i"
          :id="p.id"
          :name="p.name"
          :orig-price="p.origPrice"
          :new-price="p.newPrice"
          :discount-price="p.discountPrice"
          :discount-days="p.discountDays"
          :with-discount="p.withDiscount"
          :count-sizes="p.countSizes"
          :use-number-of-sizes="p.useNumberOfSizes"
          :color="p.color"
          :sizes="p.sizes"
          :sklad="sklad"
          :image="p.image?.url"
          class="q-mb-md"
        >
          <q-btn
            v-permissions="[CAN_UPDATE_PRODUCT]"
            round
            push
            size="md"
            class="q-mb-md"
            :to="`/sklad/${sklad?.id}/product/${p.id}`"
            v-vibrate
          >
            <q-icon
              name="mdi-eye"
              color="primary"
            />
          </q-btn>
          <q-checkbox v-model="bulkProducts" :val="p" class="q-mt-auto" />
        </CardProduct>
      </div>
      <h6
        v-else
        class="full-width flex column items-center text-center text-grey-5"
      >
        <span>
          <q-icon
            size="sm"
            name="mdi-basket-outline"
            class="q-mr-sm text-grey-5"
          />
          Список пуст
        </span>
      </h6>
    </div>
    <ProductControls
      :show="Boolean(bulkProducts?.length)"
      :title="`Выбрано: ${bulkProducts?.length}`"
      @on-close="onCloseBulk"
      @on-finish-update="onFinishBulk"
      @on-finish-remove="onFinishBulk"
    />
  </q-page>
</template>

<script>
import {
  computed,
  onBeforeMount,
  defineComponent,
} from 'vue'
import CardProduct from 'src/components/CardProduct.vue'
import PageTitle from 'src/components/PageTitle.vue'
import useProduct from 'src/modules/useProduct'
import useSklads from 'src/modules/useSklads'
import ProductControls from 'src/components/ProductControls.vue'
import {
  CAN_UPDATE_PRODUCT
} from 'src/permissions'
import { storeToRefs } from 'pinia'
import { useBulkStore } from 'src/stores/bulk';
import { useProductsStore } from 'src/stores/products'

export default defineComponent({
  name: 'ProductsWithMinSizesPage',
  components: {
    CardProduct,
    PageTitle,
    ProductControls
  },
  setup() {
    const bulkStore = useBulkStore()
    const productsStore = useProductsStore()
    const { bulkProducts } = storeToRefs(bulkStore)
    const {
      loadProductsWithMinSizes,
      refetchProductsWithMinSizes,
    } = useProduct()
    const { sklad } = useSklads()

    const products = computed(
      () => productsStore.getProductsWithMinSizes?.productsWithMinSizes
    )

    function onCloseBulk() {
      bulkStore.setBulkProducts([])
    }
    
    function onFinishBulk() {
      refetchProductsWithMinSizes()
      onCloseBulk()
    }

    onBeforeMount(() => {
      if (sklad.value?.id) {
        loadProductsWithMinSizes(
          null,
          { where: { skladId: sklad.value?.id } },
          { fetchPolicy: 'network-only' }
        )
      }
    })

    return {
      sklad,
      products,
      CAN_UPDATE_PRODUCT,
      onFinishBulk,
      onCloseBulk,
      bulkProducts,
    }
  }
})
</script>
