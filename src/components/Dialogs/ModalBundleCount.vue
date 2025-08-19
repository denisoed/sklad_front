<template>
  <q-dialog :model-value="modelValue" position="bottom" @update:model-value="$emit('update:modelValue', $event)">
    <SwipeToClose direction="down" @on-close="close">
      <q-card>
        <div class="dialog-close" id="dialog-close">
          <div class="dialog-close-line" />
        </div>
        <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
          <p class="full-width text-left text-bold q-mb-none text-subtitle1">
            {{ title || $t('bundle.dialogCountTitle') }}
          </p>
          <q-separator class="full-width q-mt-sm q-mb-md" />
          <transition name="slide-fade" mode="out-in">
            <!-- Step 1: Таблица товаров -->
            <div v-if="!isStepTwo" class="full-width">
              <div class="full-width q-mb-md">
                <TableComp
                  :rows="localItems"
                  :columns="columns"
                  :is-filters="false"
                >
                  <template #body="props">
                    <q-tr :props="props">
                      <q-td class="text-center">
                        <q-avatar size="40px">
                          <q-img width="40px" :src="props.row.image?.url" />
                        </q-avatar>
                      </q-td>
                      <q-td class="text-left">
                        <div class="text-bold">{{ props.row.name }}</div>
                        <div class="text-caption">{{ props.row.sku }}</div>
                      </q-td>
                      <q-td class="text-center">
                        <ColorDisplay size="16px" :color="props.row.color" />
                      </q-td>
                      <q-td class="text-center">
                        <q-btn
                          size="sm"
                          color="primary"
                          :label="props.row.qty"
                          @click="openQtyStep(props.row)"
                        />
                      </q-td>
                    </q-tr>
                  </template>
                </TableComp>
              </div>
              <q-separator class="full-width q-my-md" />
              <div class="flex justify-between full-width no-wrap q-gap-md">
                <q-btn class="button-size" color="grey" icon="mdi-close" push @click="close" />
                <q-btn class="button-size" color="primary" icon="mdi-check" push @click="submit" :disable="!hasAnyQty" />
              </div>
            </div>
            <!-- Step 2: Выбор количества -->
            <div v-else class="full-width full-height flex column">
              <InputPlusMinus
                v-model="selectedQty"
                :min="1"
                :max="selectedItem.max"
                :label="`${$t('common.quantity')}: <b>${selectedItem.name}</b>`"
                class="q-my-auto"
              />
              <q-separator class="full-width q-my-md" />
              <div class="flex no-wrap q-gap-md">
                <q-btn class="button-size" color="grey" icon="mdi-arrow-left" push @click="isStepTwo = false" />
                <q-btn class="button-size" color="primary" icon="mdi-check" push @click="setQtyForItem" />
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
import InputPlusMinus from 'src/components/InputPlusMinus'
import TableComp from 'src/components/TableComp.vue'
import ColorDisplay from 'src/components/ColorDisplay.vue'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['submit'])
const { t: $t } = useI18n()

const props = defineProps({
  modelValue: Boolean,
  title: String,
  items: {
    type: Array,
    default: () => [] // [{id, name, sku, max, qty}]
  }
})

const isStepTwo = ref(false)
const selectedItem = ref({})
const selectedQty = ref(1)
const localItems = ref([])

const columns = [
  { name: 'image', label: $t('common.image'), field: 'image', align: 'center' },
  { name: 'info', label: $t('common.product'), field: 'info', align: 'left' },
  { name: 'color', label: $t('common.color'), field: 'color', align: 'center' },
  { name: 'qty', label: $t('common.quantity'), field: 'qty', align: 'center' }
]

watch(() => props.modelValue, (val) => {
  if (val) {
    localItems.value = props.items.map(item => ({ ...item }))
  }
})

function openQtyStep(row) {
  selectedItem.value = row
  selectedQty.value = row.qty || 1
  isStepTwo.value = true
}

function setQtyForItem() {
  const idx = localItems.value.findIndex(i => i.id === selectedItem.value.id)
  if (idx !== -1) {
    localItems.value[idx].qty = selectedQty.value
  }
  isStepTwo.value = false
}

function close() {
  isStepTwo.value = false
  emit('update:modelValue', false)
}

const hasAnyQty = computed(() => localItems.value.some(i => i.qty && i.qty > 0))

function submit() {
  emit('submit', { items: localItems.value.filter(i => i.qty && i.qty > 0) })
  close()
}
</script>

<style lang="scss" scoped>
</style>
