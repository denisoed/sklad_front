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
            <div v-if="!isStepTwo" class="full-width">
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
                        <q-btn
                          color="primary"
                          push
                          class="border-radius-xs"
                          :label="sizesSummary(props.row)"
                          @click="openSizesStep(props.row)"
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
            <!-- Step 2 -->
            <div v-else class="full-width full-height flex column">
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
                    :disable="s.countSelected >= s.count"
                    @click="toggleSize(s)"
                  >
                    <span>{{ s.size }}<sup v-if="s.count > 1">{{ s.count > 1 ? `(${s.count} ${$t('common.pieces')})` : '' }}</sup></span>
                    <q-badge v-if="s.countSelected" color="red" floating>{{ s.countSelected }}</q-badge>
                  </q-btn>
                </div>
              </div>
              <q-separator class="full-width q-my-md" />
              <div class="flex no-wrap q-gap-md">
                <q-btn class="button-size" color="grey" icon="mdi-arrow-left" push @click="isStepTwo = false" />
                <q-btn class="button-size" color="primary" icon="mdi-check" push @click="saveSizesForItem" />
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

const isStepTwo = ref(false)
const selectedItem = ref({})
const sizesList = ref([])
const localItems = ref([])

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
    align: 'right',
    style: 'width: 120px'
  }
]

watch(() => props.modelValue, (val) => {
  if (val) {
    localItems.value = props.items.map(item => ({ ...item, selectedSizes: item.selectedSizes ? [...item.selectedSizes] : [] }))
  }
})

function openSizesStep(row) {
  selectedItem.value = row
  sizesList.value = (row.sizes || []).map(s => ({ ...s, countSelected: row.selectedSizes?.filter(sel => sel.size === s.size).length || 0 }))
  isStepTwo.value = true
}

function toggleSize(sizeObj) {
  if (sizeObj.count > 1) {
    sizeObj.countSelected = sizeObj.countSelected === sizeObj.count ? 0 : sizeObj.countSelected + 1
  } else {
    sizeObj.countSelected = sizeObj.countSelected === 0 ? 1 : 0
  }
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
  isStepTwo.value = false
}

function sizesSummary(row) {
  if (!row.selectedSizes?.length) return $t('common.select')
  const grouped = row.selectedSizes.reduce((acc, s) => {
    acc[s.size] = (acc[s.size] || 0) + 1
    return acc
  }, {})
  return Object.entries(grouped).map(([size, count]) => `${size}×${count}`).join(', ')
}

function close() {
  isStepTwo.value = false
  emit('update:modelValue', false)
}

const hasAnySizes = computed(() => localItems.value.some(i => i.selectedSizes && i.selectedSizes.length > 0))

function submit() {
  emit('submit', { items: localItems.value.filter(i => i.selectedSizes && i.selectedSizes.length > 0) })
  close()
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
</style>