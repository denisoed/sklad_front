<template>
  <div class="flex column q-gap-md">
    <q-separator />
    <TableComp
      :rows="rows"
      :columns="COLUMNS"
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
            {{ props.row.name }}
          </q-td>
          <q-td class="text-center">
            <ColorDisplay size="16px" :color="props.row.color" />
          </q-td>
          <q-td key="actions" :props="props" class="text-center">
            <q-btn
              icon="mdi-minus"
              round
              color="deep-orange"
              size="sm"
              @click="remove(props.row.id)"
            />
          </q-td>
        </q-tr>
      </template>
    </TableComp>
    <q-separator />
    <div class="flex no-wrap q-gap-md">
      <q-btn
        style="width:100%;height:40px;"
        v-close-popup
        color="grey"
        icon="mdi-close"
        push
      />
      <q-btn
        style="width:100%;height:40px;"
        color="primary"
        :icon="nextIcon"
        push
        :disable="!rows?.length"
        @click="next"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TableComp from 'src/components/TableComp.vue'
import { useBulkStore } from 'src/stores/bulk'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import ColorDisplay from 'src/components/ColorDisplay.vue'

defineOptions({
  name: 'BulkPreview'
})

defineProps({
  nextIcon: {
    type: String,
    default: 'mdi-arrow-right'
  }
})

const emit = defineEmits(['on-next'])

const { t: $t } = useI18n()
const COLUMNS = computed(() => [
  {
    name: 'image',
    label: $t('common.image'),
    field: 'image',
    align: 'center',
  },
  {
    name: 'name',
    label: $t('common.name'),
    field: 'name',
    align: 'left',
  },
  {
    name: 'color',
    label: $t('common.color'),
    field: 'color',
    align: 'center',
  },
  {
    name: 'actions',
    label: $t('common.exclude'),
    field: 'actions',
    align: 'center',
  },
])

const bulkStore = useBulkStore()
storeToRefs(bulkStore)

const rows = computed(() => {
  return bulkStore.getBulkProducts.map(s => ({
    id: s.id,
    image: s.image,
    name: s.name,
    color: s.color
  }))
})

function remove(id) {
  bulkStore.removeBulkProduct(id)
}

function next() {
  emit('on-next')
}
</script>
