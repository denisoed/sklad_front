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
            <!-- Step 1 -->
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
                        <div class="text-caption text-grey-6">#{{ props.row.id }}</div>
                        <div class="text-bold">{{ props.row.name }}</div>
                      </q-td>
                      <q-td :props="props" class="text-left" key="sizes">
                        <div v-if="props.row.useNumberOfSizes" class="q-pa-sm">
                          <InputPlusMinus
                            :min="1"
                            :max="props.row.countSizes"
                            :model-value="props.row.qty"
                            @update:model-value="val => updateQty(props.row, val)"
                            :label="$t('common.quantity')"
                          />
                        </div>
                        <div v-else class="btn-sizes_list">
                          <template v-for="(sizeObj, idx) in getSizesListForRow(props.row)" :key="idx">
                            <q-btn
                              :color="sizeObj.countSelected ? 'primary' : 'white'"
                              text-color="white"
                              :outline="!sizeObj.countSelected"
                              push
                              class="btn-sizes-btn border-radius-sm q-mr-xs q-mb-xs"
                              @click="onSizeBtnClick(props.row, sizeObj)"
                            >
                              <span>{{ sizeObj.size }}<sup v-if="sizeObj.count > 1">{{ sizeObj.count > 1 ? `(${sizeObj.count} ${$t('common.pieces')})` : '' }}</sup></span>
                              <q-badge v-if="sizeObj.countSelected > 1" color="red" floating>{{ sizeObj.countSelected }}</q-badge>
                            </q-btn>
                          </template>
                        </div>
                      </q-td>
                      <q-td :props="props" class="text-center" key="action">
                        <q-btn
                          color="negative"
                          icon="mdi-minus"
                          round
                          dense
                          size="sm"
                          @click="removeItem(props.row)"
                          :aria-label="$t('common.delete')"
                        />
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
              <q-separator class="full-width q-my-md" />
              <div class="flex justify-between full-width no-wrap q-gap-md">
                <q-btn class="button-size" color="grey" icon="mdi-close" push @click="close" />
                <q-btn class="button-size" color="primary" icon="mdi-check" push @click="submit" :disable="!hasAllSelected" />
              </div>
            </div>
            <!-- Step 2 -->
            <div v-else-if="step === 2" class="full-width full-height flex column">
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
                <q-btn class="button-size" color="grey" icon="mdi-arrow-left" push @click="step = 1" />
                <q-btn class="button-size" color="primary" icon="mdi-check" push @click="setSizeWithCounts" />
              </div>
            </div>
            <!-- Step 3 -->
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
    default: () => []
  }
})

const step = ref(1)
const localItems = ref([])
const selectedSize = ref(null)
const selectedCounts = ref(null)
const selectedRow = ref(null)

const columns = [
  {
    name: 'info',
    label: $t('common.product'),
    field: 'info',
    align: 'left'
  },
  {
    name: 'sizes',
    label: `${$t('common.sizes')}/${$t('common.quantity')}`,
    field: 'sizes',
    align: 'left',
    style: 'min-width: 120px'
  },
  {
    name: 'action',
    label: '',
    field: 'action',
    align: 'center',
    style: 'width: 40px'
  }
]

watch(() => props.modelValue, (val) => {
  if (val) {
    localItems.value = props.items.map(item => {
      if (item.useNumberOfSizes) {
        return { ...item, qty: item.qty || 1 }
      }
      return { ...item, selectedSizes: item.selectedSizes ? [...item.selectedSizes] : [] }
    })
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

function getSizesListForRow(row) {
  const uniqueSizes = [...new Set((row.sizes || []).map(s => s.size))]
  return uniqueSizes.map(size => {
    const count = getCountSize(size, row.sizes)
    const selected = row.selectedSizes ? row.selectedSizes.filter(sel => sel.size === size).length : 0
    return {
      size,
      countSelected: selected,
      count,
      has: (row.sizes || []).some(s => s.size === size)
    }
  })
}

function onSizeBtnClick(row, sizeObj) {
  if (sizeObj.count > 1) {
    selectedRow.value = row
    selectedSize.value = sizeObj
    selectedCounts.value = sizeObj.countSelected
    step.value = 2
    return
  }
  const idx = localItems.value.findIndex(i => i.id === row.id)
  if (idx !== -1) {
    const selectedSizes = localItems.value[idx].selectedSizes || []
    if (sizeObj.countSelected === 0) {
      selectedSizes.push({ size: sizeObj.size })
    } else {
      localItems.value[idx].selectedSizes = selectedSizes.filter(sel => sel.size !== sizeObj.size)
      return
    }
    localItems.value[idx].selectedSizes = selectedSizes
  }
}

function onChangeCount(count) {
  selectedCounts.value = count
}

function setSizeWithCounts() {
  if (!selectedRow.value || !selectedSize.value) return
  const idx = localItems.value.findIndex(i => i.id === selectedRow.value.id)
  if (idx !== -1) {
    localItems.value[idx].selectedSizes = (localItems.value[idx].selectedSizes || []).filter(sel => sel.size !== selectedSize.value.size)
    for (let i = 0; i < (selectedCounts.value || 0); i++) {
      localItems.value[idx].selectedSizes.push({ size: selectedSize.value.size })
    }
  }
  step.value = 1
  selectedSize.value = null
  selectedCounts.value = null
  selectedRow.value = null
}

function removeItem(row) {
  localItems.value = localItems.value.filter(item => item.id !== row.id)
}

function close() {
  step.value = 1
  selectedCounts.value = null
  selectedSize.value = null
  selectedRow.value = null
  emit('update:modelValue', false)
}

const hasAllSelected = computed(() =>
  localItems.value.length > 0 &&
  localItems.value.every(i => {
    if (i.useNumberOfSizes) {
      return i.qty && i.qty > 0
    }
    return i.selectedSizes && i.selectedSizes.length > 0
  })
)

function submit() {
  emit('submit', {
    items: localItems.value.filter(i => {
      if (i.useNumberOfSizes) {
        return i.qty && i.qty > 0
      }
      return i.selectedSizes && i.selectedSizes.length > 0
    }).map(i => {
      if (i.useNumberOfSizes) {
        return { id: i.id, name: i.name, qty: i.qty }
      }
      return { id: i.id, name: i.name, selectedSizes: i.selectedSizes }
    })
  })
}

function updateQty(row, val) {
  const idx = localItems.value.findIndex(i => i.id === row.id)
  if (idx !== -1) {
    localItems.value[idx].qty = val
  }
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
  gap: 4px;
}
.btn-sizes-btn {
  min-width: 0;
  flex: 0 1 auto;
}
</style>