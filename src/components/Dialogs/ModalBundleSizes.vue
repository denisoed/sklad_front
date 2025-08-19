<template>
  <q-dialog :model-value="modelValue" position="bottom" @update:model-value="$emit('update:modelValue', $event)">
    <SwipeToClose direction="down" @on-close="close">
      <q-card>
        <div class="dialog-close" id="dialog-close">
          <div class="dialog-close-line" />
        </div>
        <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
          <h6 class="full-width text-left text-bold q-my-none text-subtitle1">
            {{ title || $t('bundle.dialogSizesTitle') }}
          </h6>
          <p class="full-width text-left q-mb-none text-subtitle2 text-grey-5">
            {{ $t('bundle.dialogSizesDescription') }}
          </p>
          <q-separator class="full-width q-mt-sm q-mb-md" />
          <transition name="slide-fade" mode="out-in">
            <!-- Step 1: Список товаров -->
            <div v-if="step === 1" class="full-width">
              <div class="full-width q-mb-md">
                <q-table
                  :rows="localItems"
                  :columns="columns"
                  row-key="id"
                  flat
                  separator="cell"
                  :pagination="{ rowsPerPage: 0 }"
                  hide-pagination
                  class="bundle-sizes-table block-bg border-radius-sm"
                >
                  <template #body="props">
                    <q-tr :props="props">
                      <q-td :props="props" class="text-left" key="info">
                        <div class="text-bold">{{ props.row.name }}</div>
                        <div class="text-caption">{{ props.row.sku }}</div>
                      </q-td>
                      <q-td :props="props" class="text-left" key="sizes">
                        <template v-if="props.row.selectedSizes && props.row.selectedSizes.length">
                          <div class="btn-sizes_list">
                            <template v-for="(group, idx) in groupSelectedSizes(props.row.selectedSizes)" :key="idx">
                              <q-btn
                                :color="group.count > 0 ? 'primary' : 'white'"
                                text-color="white"
                                push
                                class="btn-sizes-btn border-radius-sm q-mr-xs q-mb-xs"
                              >
                                <span>{{ group.size }}<sup v-if="group.count > 1">{{ group.count > 1 ? `(${group.count} ${$t('common.pieces')})` : '' }}</sup></span>
                                <q-badge v-if="group.count > 1" color="red" floating>{{ group.count }}</q-badge>
                              </q-btn>
                            </template>
                          </div>
                        </template>
                        <template v-else>
                          <span>{{ $t('common.select') }}</span>
                        </template>
                      </q-td>
                      <q-td :props="props" class="text-right" key="action">
                        <q-btn
                          color="primary"
                          icon="mdi-pencil"
                          round
                          dense
                          size="sm"
                          @click="openSizesStep(props.row)"
                          :aria-label="$t('common.select')"
                        />
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
              <q-separator class="full-width q-my-md" />
              <div class="flex justify-between full-width no-wrap q-gap-md">
                <q-btn class="button-size" color="grey" icon="mdi-close" push @click="close" />
                <q-btn class="button-size" color="primary" icon="mdi-check" push @click="submit" :disable="!hasAnySizes" />
              </div>
            </div>
            <!-- Step 2: Список размеров для товара -->
            <div v-else-if="step === 2" class="full-width full-height flex column">
              <div class="q-mb-md">
                <div class="text-bold q-mb-xs">{{ selectedItem.name }}</div>
                <div class="text-caption">{{ selectedItem.sku }}</div>
              </div>
              <div class="full-width flex column">
                <p class="q-mb-sm">{{ $t('common.sizes') }}</p>
                <div class="btn-sizes_list">
                  <q-btn
                    v-for="(s, i) in sizesList"
                    :key="i"
                    :color="!s.countSelected ? 'white' : 'primary'"
                    text-color="white"
                    :outline="!s.countSelected"
                    push
                    class="btn-sizes-btn border-radius-sm"
                    @click="toggleSize(s)"
                  >
                    <span>{{ s.size }}<sup v-if="s.count > 1">{{ s.count > 1 ? `(${s.count} ${$t('common.pieces')})` : '' }}</sup></span>
                    <q-badge v-if="s.countSelected > 1" color="red" floating>{{ s.countSelected }}</q-badge>
                  </q-btn>
                </div>
              </div>
              <q-separator class="full-width q-my-md" />
              <div class="flex no-wrap q-gap-md">
                <q-btn class="button-size" color="grey" icon="mdi-arrow-left" push @click="step = 1" />
                <q-btn class="button-size" color="primary" icon="mdi-check" push @click="saveSizesForItem" />
              </div>
            </div>
            <!-- Step 3: Ввод количества для размера -->
            <div v-else-if="step === 3" class="full-width full-height flex column">
              <InputPlusMinus
                :max="selectedSize.count"
                :min="0"
                :model-value="selectedCounts"
                :label="`${$t('common.quantityForSize')}: <b>${selectedSize.size}</b>`"
                class="q-my-auto"
                @update:model-value="onChangeCount"
              />
              <q-separator class="full-width q-my-md" />
              <div class="flex no-wrap q-gap-md">
                <q-btn class="button-size" color="grey" icon="mdi-arrow-left" push @click="step = 2" />
                <q-btn class="button-size" color="primary" icon="mdi-check" push @click="setSizeWithCounts" />
              </div>
            </div>
          </transition>
        </q-card-section>
      </q-card>
    </SwipeToClose>
  </q-dialog>
</template>

<script setup>
import SwipeToClose from 'src/components/SwipeToClose.vue'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import InputPlusMinus from 'src/components/InputPlusMinus.vue'

const emit = defineEmits(['submit'])
const { t: $t } = useI18n()

const props = defineProps({
  modelValue: Boolean,
  title: String,
  items: {
    type: Array,
    default: () => [] // [{id, name, sku, sizes: [{size, count}], selectedSizes: []}]
  }
})

const step = ref(1) // 1 - товары, 2 - размеры, 3 - количество
const selectedItem = ref({})
const sizesList = ref([])
const localItems = ref([])
const selectedSize = ref(null)
const selectedCounts = ref(null)

const columns = [
  {
    name: 'info',
    label: $t('common.product'),
    field: 'info',
    align: 'left'
  },
  {
    name: 'sizes',
    label: $t('common.sizes'),
    field: 'sizes',
    align: 'left',
    style: 'min-width: 120px'
  },
  {
    name: 'action',
    label: '',
    field: 'action',
    align: 'right',
    style: 'width: 60px'
  }
]

watch(() => props.modelValue, (val) => {
  if (val) {
    localItems.value = props.items.map(item => ({ ...item, selectedSizes: item.selectedSizes ? [...item.selectedSizes] : [] }))
    step.value = 1
  }
})

function getCountSize(size, sizesArr) {
  let count = 0
  sizesArr.forEach(s => {
    if (s.size === size) {
      count += 1
    }
  })
  return count
}

function createListSizes(row) {
  const uniqueSizes = [...new Set((row.sizes || []).map(s => s.size))]
  sizesList.value = uniqueSizes.map(size => {
    const count = getCountSize(size, row.sizes)
    // сколько уже выбрано
    const selected = row.selectedSizes ? row.selectedSizes.filter(sel => sel.size === size).length : 0
    return {
      size,
      countSelected: selected,
      count,
      has: (row.sizes || []).some(s => s.size === size)
    }
  })
}

function openSizesStep(row) {
  selectedItem.value = row
  createListSizes(row)
  step.value = 2
}

function toggleSize(sizeObj) {
  if (sizeObj.count > 1) {
    selectedSize.value = sizeObj
    selectedCounts.value = sizeObj.countSelected
    step.value = 3
    return
  }
  // Для единичных размеров просто переключаем 0/1
  sizesList.value = sizesList.value.map(ls => {
    if (ls.size === sizeObj.size) {
      return {
        ...ls,
        countSelected: ls.countSelected === 0 ? 1 : 0
      }
    }
    return ls
  })
}

function onChangeCount(count) {
  selectedCounts.value = count
}

function setSizeWithCounts() {
  step.value = 2
  sizesList.value = sizesList.value.map(ls => {
    if (ls.size === selectedSize.value.size) {
      return {
        ...ls,
        countSelected: selectedCounts.value !== null ? selectedCounts.value : ls.countSelected
      }
    }
    return ls
  })
  selectedSize.value = null
  selectedCounts.value = null
}

function saveSizesForItem() {
  const idx = localItems.value.findIndex(i => i.id === selectedItem.value.id)
  if (idx !== -1) {
    localItems.value[idx].selectedSizes = []
    sizesList.value.forEach(s => {
      for (let i = 0; i < s.countSelected; i++) {
        localItems.value[idx].selectedSizes.push({ size: s.size })
      }
    })
  }
  step.value = 1
}

function sizesSummary(row) {
  if (!row.selectedSizes?.length) return $t('common.select')
  // Группируем только выбранные размеры
  const grouped = row.selectedSizes.reduce((acc, s) => {
    acc[s.size] = (acc[s.size] || 0) + 1
    return acc
  }, {})
  // Оставляем только те, где выбрано больше 0
  const filtered = Object.entries(grouped).filter(([size, count]) => count > 0)
  if (!filtered.length) return $t('common.select')
  return filtered.map(([size, count]) => `${size}×${count}`).join(', ')
}

function close() {
  step.value = 1
  selectedCounts.value = null
  selectedSize.value = null
  sizesList.value = []
  emit('update:modelValue', false)
}

const hasAnySizes = computed(() => localItems.value.some(i => i.selectedSizes && i.selectedSizes.length > 0))

function submit() {
  emit('submit', { items: localItems.value.filter(i => i.selectedSizes && i.selectedSizes.length > 0) })
  close()
}

function groupSelectedSizes(selectedSizes) {
  // Группируем по size
  const map = new Map()
  selectedSizes.forEach(s => {
    map.set(s.size, (map.get(s.size) || 0) + 1)
  })
  // Возвращаем массив объектов { size, count }
  return Array.from(map.entries()).map(([size, count]) => ({ size, count }))
}
function groupLabel(group) {
  return group.count > 1 ? `${group.size}×${group.count}` : `${group.size}`
}
</script>

<style lang="scss" scoped>
.bundle-sizes-table {
  :deep(.q-table__top),
  :deep(.q-table__bottom),
  :deep(.q-table__bottom) .q-table__control {
    display: none;
  }
  :deep(.q-table__top),
  :deep(thead tr:first-child th) {
    font-weight: bold;
  }
  :deep(.q-table) {
    border-radius: var(--border-radius-sm);
    overflow: hidden;
  }
}
.btn-sizes_list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.btn-sizes-btn {
  min-width: 0;
  flex: 0 1 auto;
}
</style>