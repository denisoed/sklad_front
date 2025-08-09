<template>
  <q-page>
    <div class="container">
      <PageTitle :title="pageTitle">
        <template #custom>
          <q-btn
            v-if="isEdit"
            v-permissions="{ permissions: [READ_HISTORY, CAN_REMOVE_PRODUCT, CAN_ADD_PRODUCT], skladId: product?.sklad }"
            icon="mdi-cog-outline"
            push
            round
            text-color="primary"
            class="q-ml-auto"
          >
            <q-menu style="width: 200px;">
              <q-list>
                <q-item
                  v-permissions="{ permissions: [CAN_ADD_PRODUCT], skladId: product?.sklad }"
                  clickable
                  v-close-popup
                  py="10px"
                >
                  <q-item-section
                    @click="duplicateProduct"
                  >
                    <div class="flex items-center">
                      <q-icon name="mdi-content-duplicate" class="q-mr-sm" size="xs" />
                      <span>Дублировать</span>
                    </div>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="historyLink"
                  v-permissions="{ permissions: [READ_HISTORY], skladId: product?.sklad }"
                  :to="historyLink"
                  clickable
                  v-close-popup
                >
                  <q-item-section>
                    <div class="flex no-wrap items-center">
                      <q-icon name="mdi-history" class="q-mr-sm" size="xs" />
                      История товара
                    </div>
                  </q-item-section>
                </q-item>
                <q-item
                  v-permissions="{ permissions: [CAN_REMOVE_PRODUCT], skladId: product?.sklad }"
                  clickable
                  v-close-popup
                  py="10px"
                >
                  <q-item-section
                    @click="cancel('remove')"
                  >
                    <div class="flex items-center">
                      <q-icon name="mdi-trash-can-outline" class="q-mr-sm text-deep-orange" size="xs" />
                      <span class="text-deep-orange">Удалить этот товар</span>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </template>
      </PageTitle>

      <h6
        class="full-width text-center text-grey-5"
        v-if="loadingProduct"
      >
        <span>
          <q-icon
            size="sm"
            name="mdi-loading"
            class="mdi-spin q-mr-sm "
          />
          Загрузка...
        </span>
      </h6>

      <q-form
        v-else
        class="q-gap-md"
        @submit="submit(isEdit ? 'update' : 'create')"
        @validation-error="onValidationError"
      >
        <div class="row">
          <div class="col-12 q-mb-md">
            <div
              v-if="isDuplicating"
              class="flex items-center border-radius-sm q-pa-sm q-mb-md q-px-md"
              style="background-color: rgb(255 255 0 / 8%);"
            >
              <span>Дублируется товар: <strong>#{{ duplicatedFromID }}</strong></span>
              <q-icon name="mdi-content-duplicate" class="q-ml-auto" color="primary" size="sm" />
            </div>
            <div
              v-if="product.withDiscount"
              class="flex items-center q-pa-sm q-mb-md q-px-md border-radius-sm"
              style="background-color: rgb(255 0 0 / 8%);border-radius: 3px;"
            >
              <span class="q-mr-sm">На этот товар действует акция</span>
              <q-icon class="mdi mdi-alert-circle q-ml-auto" color="red-5" size="sm" />
            </div>

            <!-- Sklads -->
            <TheSelector
              v-model="product.sklad"
              title-postfix="склад"
              :options="skladsOptions"
              @on-create-new="onCreateNewSklad"
              outlined
              class="q-mb-md"
              label="Склад *"
              hint="Привязать товар к складу"
              tabindex="1"
              clearable
              emit-value
              map-options
              :rules="[() => !!product.sklad || 'Обязательное поле']"
            />

            <!-- Categories -->
            <TheSelector
              v-if="product.sklad"
              v-model="product.category"
              :options="categoriesOptions"
              @on-create-new="onCreateNewCategory"
              outlined
              class="q-mb-md"
              label="Категория товара"
              hint="Привязать товар к категории"
              tabindex="2"
              clearable
              emit-value
              map-options
            />

            <ImageUploader
              :image="product.image"
              class="q-mb-md"
              tabindex="3"
              hint="Обязательное поле"
              :rules="[val => val?.length || 'Обязательное поле']"
              @on-change="product.image = $event"
              @clear="product.image = null"
            />

            <div class="flex no-wrap q-gap-md">
              <div class="full-width" id="name">
                <q-input
                  v-model="product.name"
                  outlined
                  label="Название товара *"
                  hint="Обязательное поле"
                  :rules="[val => val?.length || 'Обязательное поле']"
                  tabindex="4"
                  class="full-width"
                  data-scroller="name"
                  enterkeyhint="done"
                />
              </div>
              <q-input
                v-if="isEdit"
                class="articul"
                v-model="product.id"
                outlined
                label="Артикул(ID)"
                readonly
                enterkeyhint="done"
              />
            </div>
          </div>
          <div
            v-permissions="{ permissions: [READ_ORIGINAL_PRICE], skladId: product?.sklad }"
            class="col-12 q-mb-md"
          >
            <InputPrice
              data-scroller="origPrice"
              v-model="product.origPrice"
              label="Оптовая цена за 1 шт *"
              hint="Обязательное поле"
              clear
              :rules="[val => val?.length || 'Обязательное поле']"
              tabindex="5"
            />
          </div>
          <div class="col-12">
            <NewPriceInput
              :retail-price="product.newPrice"
              :additional-prices="product.prices || []"
              @on-change="onPriceChange"
            />
          </div>
          <div
            class="full-width border-radius-sm"
            style="border: 1px solid var(--border-color);"
          >
            <q-checkbox
              v-model="product.withDiscount"
              label="Установить акционную цену"
              class="full-width"
            />
            <div v-if="product.withDiscount" class="col-12 q-pa-sm">
              <template v-if="product.discountDays">
                <p v-if="!isDiscountToday" class="flex items-center no-wrap q-px-sm product-page_discount-not-today">
                  <span class="q-mr-sm">На сегодня акции нет</span>
                  <q-icon class="mdi mdi-alert-circle q-ml-auto" color="red-5" size="xs" />
                </p>
                <InputPrice
                  v-model="product.discountPrice"
                  label="Акционная цена за 1 шт"
                  clear
                  tabindex="7"
                  :rules="[
                    val => val?.length || 'Укажите акционную цену',
                    val => +val !== 0 || 'Укажите акционную цену',
                    val => +(val.replace(/[^\d\.\-]/g, '')) < +product.newPrice || 'Акционная цена должна быть меньше Роз. цены'
                  ]"
                />
              </template>
              <div class="flex items-center no-wrap q-px-md q-py-sm product-page_discount">
                <div v-if="product.discountDays" class="q-mr-sm product-page_discount-dates">
                  <p class="q-mr-md q-mb-sm">
                    Акция на даты:
                  </p>
                  <div class="flex q-gap-xs">
                    <q-chip
                      v-for="(day, i) of product.discountDays"
                      :key="i"
                      dense
                      outline
                      size="12px"
                      color="primary"
                    >
                      <span class="text-white">{{ day }}</span>
                    </q-chip>
                  </div>
                </div>
                <p v-else class="q-mr-md q-mb-none">Выставить акционную цену на определенные даты</p>
                <FilterDates
                  class="q-ml-auto"
                  :with-buttons="false"
                  disable-prev-dates
                  @on-change="setDiscount"
                />
              </div>
            </div>
          </div>

          <!-- Sizes -->
          <div class="col-12">
            <div
              class="full-width q-mt-md border-radius-sm"
              style="border: 1px solid var(--border-color);"
            >
              <div class="flex q-gap-md items-center justify-between">
                <q-checkbox
                  :model-value="!product.useNumberOfSizes"
                  @update:model-value="product.useNumberOfSizes = !$event"
                  label="Использовать размеры"
                />
              </div>
              <h6
                class="q-ma-none q-px-sm  text-subtitle2 text-grey-5"
              >
                Этот параметр позволяет использовать размеры для товара
              </h6>
              <div v-if="product.useNumberOfSizes" class="q-pa-sm">
                <q-separator />
                <p class="q-mt-md q-mb-sm">Количество:</p>
                <InputPlusMinus
                  v-model="product.countSizes"
                  :max="1000000"
                  @on-change="onChangeSizes"
                />
              </div>
              <div v-else class="q-pa-sm">
                <ProductSizes
                  v-if="sizes?.length"
                  :sizes="sizes"
                  :selected="product?.sizes"
                  :type-size-id="product?.typeSize?.id"
                  @on-change="onChangeSizes"
                  tabindex="8"
                />
                <div v-else class="flex column items-center full-width q-my-md">
                  <q-btn
                    color="primary"
                    class="q-mt-sm"
                    to="/main-settings?tab=sizes"
                    push
                  >
                    Настроить размеры
                  </q-btn>
                </div>
              </div>
            </div>
          </div>

          <!-- Colors -->
          <div data-scroller="color" class="col-12 q-mt-md flex flex-center">
            <ColorPicker
              :selected="product.color"
              tabindex="7"
              @on-change="setColorName"
            />
          </div>
        </div>

        <div class="row q-mt-md">
          <div class="col-12 flex">
            <div v-if="isEdit" v-permissions="{ permissions: [CAN_SELL_PRODUCT], skladId: product?.sklad }">
              <q-btn
                icon="mdi-basket-plus-outline"
                push
                color="deep-orange"
                mr="auto"
                :disable="!product?.countSizes && !product?.sizes?.length"
                @click="product?.useNumberOfSizes ? modalCountToBucket = true : modalSizesToBucket = true"
              />
            </div>
            <q-btn
              v-permissions="{ permissions: [CAN_ADD_PRODUCT, CAN_UPDATE_PRODUCT], skladId: product?.sklad }"
              type="submit"
              :label="submitBtnLabel"
              push
              color="primary"
              class="q-ml-auto"
              :disable="(isDirty || createProductLoading || updateProductLoading)"
              :loading="uploadImageLoading || createProductLoading || updateProductLoading"
              tabindex="8"
            />
          </div>
        </div>
      </q-form>
    </div>

    <ModalCountToBucket
      v-if="product?.useNumberOfSizes"
      v-model="modalCountToBucket"
      :max="product?.countSizes"
      :prices="product?.prices"
      :new-price="product?.withDiscount ? product?.discountPrice : product?.newPrice"
      @submit="onAddCountToBucket(product, $event)"
    />

    <ModalSizesToBucket
      v-if="!product?.useNumberOfSizes"
      v-model="modalSizesToBucket"
      :sizes="product?.sizes"
      :prices="product?.prices"
      :type-sizes="product?.typeSize?.list || []"
      :new-price="product?.withDiscount ? product?.discountPrice : product?.newPrice"
      @submit="onAddSizesToBucket(product, $event)"
    />
  </q-page>
</template>

<script setup>
import moment from 'moment'
import { useQuasar } from 'quasar'
import { useMutation, useLazyQuery } from '@vue/apollo-composable'
import useProduct from 'src/modules/useProduct'
import useHelpers from 'src/modules/useHelpers'
import useSklads from 'src/modules/useSklads'
import useCosts from 'src/modules/useCosts'
import FilterDates from 'src/components/FilterDates.vue'
import InputPlusMinus from 'src/components/InputPlusMinus.vue'
import ModalCountToBucket from 'src/components/Dialogs/ModalCountToBucket.vue'
import ModalSizesToBucket from 'src/components/Dialogs/ModalSizesToBucket.vue'
import ProductSizes from 'src/components/Product/ProductSizes.vue'
import {
  UPLOAD,
  DELETE_FILE,
  GET_PRODUCT,
} from 'src/graphql/types'
import {
  computed,
  ref,
  reactive,
  watch,
  onBeforeUnmount,
} from 'vue'
import ColorPicker from 'src/components/ColorPicker.vue'
import TheSelector from 'src/components/UI/TheSelector.vue'
import ImageUploader from 'src/components/ImageUploader.vue'
import InputPrice from 'src/components/InputPrice.vue'
import NewPriceInput from 'src/components/Product/NewPriceInput.vue'
import PageTitle from 'src/components/PageTitle.vue'
import { useRoute, useRouter } from 'vue-router'
import useSizes from 'src/modules/useSizes'
import useDialog from 'src/modules/useDialog'
import { MANAGE_CATEGORY_DIALOG, MANAGE_SKLAD_DIALOG } from 'src/config/dialogs'
import {
  FILTER_FORMAT,
} from 'src/config'
import {
  READ_ORIGINAL_PRICE,
  CAN_REMOVE_PRODUCT,
  CAN_SELL_PRODUCT,
  CAN_UPDATE_PRODUCT,
  CAN_ADD_PRODUCT,
  READ_HISTORY
} from 'src/permissions'
import isEqual from 'lodash.isequal'
import useProfile from 'src/modules/useProfile'
import useProductDuplication from 'src/modules/useProductDuplication'
import useDraft from 'src/modules/useDraft'
import useCategories from 'src/modules/useCategories'
import useEventBus from 'src/modules/useEventBus'

const DEFAULT_DATA = {
  id: null,
  sklad: null,
  category: null,
  name: null,
  origPrice: null,
  newPrice: null,
  discountPrice: null,
  discountDays: null,
  withDiscount: false,
  color: '#000000',
  colorName: null,
  sizes: [],
  countSizes: 0,
  useNumberOfSizes: true,
  image: null,
  typeSizeId: null,
  imageId: null,
  prices: [],
}

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: true
  }
})

const TODAY = Date.now()
const $q = useQuasar()
const { params, query } = useRoute()
const { replace, push } = useRouter()
const { showSuccess, showError } = useHelpers()
const { profile } = useProfile()
const { openDialog } = useDialog()
const { sizes, fetchSizes } = useSizes()
const {
  addSizesToBucket,
  addCountToBucket,
  removeProduct,
  updateProductById,
  updateProductError,
  updateProductLoading,
  generateProductMeta,
  createNewProduct,
  createProductError,
  createProductLoading
} = useProduct()
const {
  createCost,
  errorCost
} = useCosts()
const { sklads } = useSklads()

const modalCountToBucket = ref(false)
const modalSizesToBucket = ref(false)

const {
  isDuplicating,
  duplicatedFromID,
  loadDuplicateData,
  clearDuplicateData,
  duplicateProduct: duplicateProductAction,
  applyDuplicateData
} = useProductDuplication()

const { clearDraft: clearDraftAction } = useDraft()

// Event bus for global communication
const { onBus, offBus, BUS_EVENTS } = useEventBus()

const {
  mutate: uploadImage,
  error: uploadImageError,
  loading: uploadImageLoading
} = useMutation(UPLOAD)
const {
  mutate: removeImage,
  loading: removeImageLoading,
} = useMutation(DELETE_FILE)
const {
  load: getEditProduct,
  result: editProduct,
  loading: loadingProduct,
  refetch: refetchEditProduct
} = useLazyQuery(GET_PRODUCT)
const { categories: categoriesResult, fetchCategories } = useCategories()

const product = reactive({ ...DEFAULT_DATA })
const copiedProductForDirty = reactive({})

function onChangeSizes(sizes) {
  product.sizes = sizes.list
  product.typeSizeId = sizes.id
}

function onPriceChange(priceData) {
  product.newPrice = priceData.retailPrice
  product.prices = [...priceData.additionalPrices]
}

async function uploadImg(file) {
  const response = await uploadImage({ file });
  return response;
}

function onCreateNewSklad() {
  openDialog(MANAGE_SKLAD_DIALOG)
}

function onCreateNewCategory() {
  openDialog(MANAGE_CATEGORY_DIALOG, {
    skladId: product.sklad
  })
}

// Helper function to prepare product data
function prepareProductData(uploaded, isDuplicate = false, isEdit = false) {
  // Prepare prices based on operation type
  let pricesToClean
  if (isDuplicate) {
    pricesToClean = product.prices?.map(price => ({
      name: price.name,
      price: price.price,
    })) || []
  } else if (isEdit) {
    pricesToClean = product.prices?.filter(price => !price.id) || []
  } else {
    pricesToClean = product.prices || []
  }
  
  const cleanPrices = pricesToClean.map(price => {
    const { __typename, ...cleanPrice } = price
    return cleanPrice
  })
  
  const typeSizeId = getTypeSizeId()

  return {
    name: product.name,
    sklad: product.sklad,
    category: product.category,
    origPrice: Number(product.origPrice),
    newPrice: Number(product.newPrice),
    discountPrice: Number(product.discountPrice),
    discountDays: product.discountDays,
    withDiscount: product.withDiscount,
    image: uploaded ? uploaded.data.upload.id : product.imageId,
    color: product.color,
    colorName: product.colorName,
    sizes: isDuplicate || isEdit ? product.sizes.map(s => ({ size: s.size })) : product.sizes,
    countSizes: product.countSizes,
    useNumberOfSizes: product.useNumberOfSizes,
    prices: cleanPrices,
    meta: generateProductMeta(product),
    ...(typeSizeId ? { typeSize: Number(typeSizeId) } : {}),
    ...(isDuplicate && duplicatedFromID.value ? { duplicateFrom: duplicatedFromID.value } : {})
  }
}

// Helper function to handle image upload
async function handleImageUpload() {
  let uploaded = null
  if (typeof product.image !== 'string') {
    uploaded = await uploadImg(product.image)
  }
  return { uploaded, hasError: uploadImageError.value }
}

// Helper function to handle image cleanup on error
async function cleanupImageOnError(uploaded) {
  if (uploaded) {
    await removeImage({ id: uploaded.data.upload.id })
  }
}

function setColorName(item) {
  product.color = item.color
  product.colorName = item.name
}

function resetAll() {
  Object.assign(product, DEFAULT_DATA)
  clearDraft()
  clearDuplicateData()
}

async function onAddCountToBucket(item, payload) {
  await addCountToBucket({
    ...item,
    sklad: {
      id: item.sklad
    }
  }, payload)
  refetchEditProduct()
}

async function onAddSizesToBucket(item, payload) {
  await addSizesToBucket({
    ...item,
    sklad: {
      id: item.sklad
    }
  }, payload)
  refetchEditProduct()
}

function clearDraft() {
  clearDraftAction();
  clearDuplicateData();
}

async function saveCost(sum, isAdd) {
  const description = isAdd ? `Добавлены размеры в товар: ${product.name}`: `Убраны размеры из товара: ${product.name}`
  await createCost(description, sum)
  if (!errorCost.value) {
    history(
      isAdd ? HISTORY_UPDATE : HISTORY_DELETE,
      `${isAdd ? 'Добавлены размеры в товар' : 'Убраны размеры из товара'}: ${product.name}. Сумма: ${sum}`
    )
  } else {
    showError('Произошла ошибка. Попробуйте позже.')
  }
}

async function handleCost() {
  const pL = product?.sizes?.length
  const cL = copiedProductForDirty?.sizes?.length
  const isAdd = product.countSizes ?
    product.countSizes > copiedProductForDirty.countSizes :
    (!cL || pL > cL)
  if (isAdd) {
    const sizesLength = pL - (cL || 0)
    const sum = ((product.countSizes - copiedProductForDirty.countSizes) || sizesLength) * product.origPrice
    if (sum > 0) {
      saveCost(sum, true)
    }
  } else {
    const sizesLength = cL - pL
    const sum = 0 - (((copiedProductForDirty.countSizes - product.countSizes) || sizesLength) * product.origPrice)
    saveCost(sum, false)
  }
}

function getTypeSizeId() {
  if (isDuplicating.value) {
    return product.typeSize?.id
  }
  return product.typeSizeId
}

async function create() {
  const { uploaded, hasError } = await handleImageUpload()
  
  if (hasError) {
    showError('Не удалось загрузить фото. Проблемы на сервере.')
    return
  }

  try {
    const data = prepareProductData(uploaded, isDuplicating.value, props.isEdit)
    const newProduct = await createNewProduct(data)
    if (!createProductError.value) {
      showSuccess('Товар успешно создан!')
      clearDraft()
      replace(`/products?product=${newProduct.id}`)
    } else {
      await cleanupImageOnError(uploaded)
      showError('Не удалось создать продукт. Проблемы на сервере.')
    }
  } catch (error) {
    console.error(error)
    await cleanupImageOnError(uploaded)
    showError('Не удалось создать продукт. Проблемы на сервере.')
  }
}

async function update() {
  const { uploaded, hasError } = await handleImageUpload()
  
  if (hasError) {
    showError('Не удалось загрузить фото. Проблемы на сервере.')
    return
  }

  try {
    const data = prepareProductData(uploaded, false, true)
    await updateProductById(params?.productId, data, editProduct.value?.product)
    
    if (!updateProductError.value) {
      if (typeof product.image !== 'string' && product.imageId) {
        removeImage({ id: product.imageId })
        product.imageId = null
      }
      // Создаем глубокую копию для корректного отслеживания изменений
      Object.assign(copiedProductForDirty, {
        ...product,
        prices: [...(product.prices || [])]
      })
      showSuccess('Продукт успешно обновлён!')
    } else {
      await cleanupImageOnError(uploaded)
      showError('Не удалось обновить продукт. Проблемы на сервере.')
    }
  } catch (error) {
    console.log(error)
    await cleanupImageOnError(uploaded)
    showError('Не удалось обновить продукт. Проблемы на сервере.')
  }
}

async function onValidationError(ref) {  
  const el = ref.$el
  el.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

async function submit(type) {
  // handleCost()
  if (type === 'create') {
    return create()
  }
  if (type === 'update') {
    return update()
  }
}

function duplicateProduct() {
  duplicateProductAction(product)
}

function cancel(type) {
  $q.dialog({
    title: type === 'remove' ? 'Удалить этот товар?' : 'Сбосить введенные значения?',
    message: type === 'remove' ? 'При удалении товара, он пропадет со склада навсегда!' : 'Всё что Вы ввели будет стёрто!',
    cancel: true,
    persistent: true,
    ok: {
      color: 'deep-orange',
      label: type === 'remove' ? 'Удалить' : 'Сбросить',
      push: true
    },
    cancel: {
      color: 'white',
      textColor: 'black', 
      label: 'Отмена',
      push: true
    }
  }).onOk(async () => {
    if (type === 'reset') {
      resetAll()
    } else {
      await removeProduct(params?.productId, editProduct.value?.product)
      showSuccess('Товар успешно удалён!')
      push('/products')
    }
  })
}

function setCategoryFromParams() {
  if (query?.category) {
    const category = categoriesResult.value.find(c => c.id === query?.category)
    if (category) {
      product.category = category.id
    }
  }
}

function setDiscount({ dates }) {
  product.discountDays = dates
}

function loadData() {
  fetchSizes(profile.value.id)
  
  if (!params?.productId) {
    const duplicateData = loadDuplicateData()
    if (duplicateData) {
      applyDuplicateData(product, duplicateData)
    }
  } else {
    getEditProduct(
      null,
      { id: params?.productId },
      {
        fetchPolicy: 'network-only'
      }
    )
  }
}

const skladsOptions = computed(() => {
  return sklads.value?.map(c => ({
    label: c.name,
    value: c.id
  }))
})

const categoriesOptions = computed(() => {
  return categoriesResult.value?.map(c => ({
    label: c.name,
    value: c.id
  }))
})

const historyLink = computed(
  () => product?.sklad ?
    `/sklad/${product.sklad}/history/${params?.productId}?product=${product?.name}` :
      null
)
const isDiscountToday = computed(() => {
  return product?.discountDays?.some(d => d === moment(TODAY).format(FILTER_FORMAT))
})
const isDirty = computed(() => isEqual(product, copiedProductForDirty))
const pageTitle = computed(() => {
  if (isDuplicating.value) {
    return 'Дублирование товара'
  } else if (props.isEdit) {
    return 'Редактирование товара'
  }
  return 'Создание товара'
})
const submitBtnLabel = computed(() => {
  if (isDuplicating.value) {
    return 'Дублировать'
  } else if (props.isEdit) {
    return 'Обновить'
  }
  return 'Сохранить'
})

async function hanleProductCategotyBySklad(skladId) {
  product.category = null
  await fetchCategories({ sklad: skladId })
  product.category = editProduct.value?.product?.category?.id
}

watch(categoriesResult, (newValue) => {
  if (newValue?.length) {
    setCategoryFromParams()
  }
})

watch(editProduct, (newValue) => {
  if (newValue?.product) {
    Object.assign(product, {
      ...newValue.product,
      sklad: newValue.product.sklad?.id,
      category: newValue.product.category?.id,
      image: newValue.product.image?.url,
      imageId: newValue.product.image?.id
    })
    // Создаем глубокую копию для корректного отслеживания изменений
    Object.assign(copiedProductForDirty, {
      ...product,
      prices: [...(product.prices || [])]
    })
  }
});

watch(sklads, (val) => {
  if (val?.length) {
    loadData();
  }
}, {
  immediate: true
});

// Subscribe to global duplicate event
onBus(BUS_EVENTS.DUPLICATE_PRODUCT, duplicateProduct)

watch(() => product.sklad, (skladId) => {
  hanleProductCategotyBySklad(skladId)
});

onBeforeUnmount(() => {
  offBus(BUS_EVENTS.DUPLICATE_PRODUCT, duplicateProduct)
})
</script>

<style lang="scss" scoped>
  .product-page_discount {
    background-color: rgba($color: red, $alpha: 0.1);
    border-radius: 3px;

    &-dates {
      width: 250px;
      max-width: 250px;
    }

    &-not-today {
      color: var(--text-black);
      margin-bottom: 8px;
      background-color: rgba($color: red, $alpha: 0.1);
      border-radius: 3px;
    }

  }

  .speech-recog {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 85px;
    z-index: 2222;
  }

  .articul {
    max-width: 100px;
  }

  .q-checkbox {
    line-height: normal;
  }
</style>
