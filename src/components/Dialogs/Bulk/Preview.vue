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
          <q-td class="text-left">
            <q-img width="40px" :src="props.row.image?.url" />
          </q-td>
          <q-td class="text-left">
            {{ props.row.name }}
          </q-td>
          <q-td class="text-left">
            <div
              class="bulk-preview-color"
              :style="`background-color: ${props.row.color};`"
            />
          </q-td>
          <q-td key="actions" :props="props" class="text-right">
            <q-btn
              icon="mdi-trash-can-outline"
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

<script>
import { defineComponent, computed } from 'vue';
import TableComp from 'src/components/TableComp.vue'
import { useBulkStore } from 'src/stores/bulk';

const COLUMNS = [
  {
    name: 'image',
    label: 'Фото',
    field: 'image',
    align: 'left',
  },
  {
    name: 'name',
    label: 'Название',
    field: 'name',
    align: 'left',
  },
  {
    name: 'color',
    label: 'Цвет',
    field: 'color',
    align: 'left',
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'right',
  },
]

export default defineComponent({
  name: 'BulkPreview',
  components: {
    TableComp,
  },
  props: {
    nextIcon: {
      type: String,
      default: 'mdi-arrow-right',
    }
  },
  emits: ['on-next'],
  setup(props, { emit }) {
    const bulkStore = useBulkStore();

    const rows = computed(() => {
      return bulkStore.getBulkProducts.map(s => ({
        id: s.id,
        image: s.image,
        name: s.name,
        color: s.color
      }));
    })

    function remove(id) {
      bulkStore.removeBulkProduct(id)
    }

    function next() {
      emit('on-next')
    }

    return {
      COLUMNS,
      remove,
      next,
      rows,
    }
  }
})
</script>

<style lang="scss" scoped>
.bulk-preview-color {
  width: 32px;
  height: 16px;
  border-radius: 3px;
}
</style>