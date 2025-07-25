<template>
  <div class="product-controls block-bg" :class="{ 'product-controls--shown': show }">
    <div class="product-controls_title full-width flex justify-center">
      <div class="product-controls_wrap">
        {{ title }}
      </div>
    </div>
    <div class="full-width flex justify-center q-pb-lg q-pt-xs">
      <div class="product-controls_wrap">
        <BulkRemoveDialog
          title="Удаление"
          v-permissions="[CAN_REMOVE_PRODUCT]"
          @on-finish="onFinishRemove"
        >
          <q-btn
            round
            push
            size="md"
            color="deep-orange"
            @click="onDelete"
          >
            <q-icon
              name="mdi-trash-can-outline"
              color="deep-orange"
            />
          </q-btn>
        </BulkRemoveDialog>
        <BulkUpdateDialog
          v-permissions="[CAN_UPDATE_PRODUCT]"
          title="Редактирование"
          @on-finish="onFinishUpdate"
        >
          <q-btn
            round
            push
            size="md"
            class="q-ml-md"
            color="primary"
            @click="onEdit"
          >
            <q-icon
              name="mdi-pencil"
              color="primary"
            />
          </q-btn>
        </BulkUpdateDialog>
        <BulkPrintDialog
          title="Печать ценников"
          @on-finish="onFinishPrint"
          class="hidden"
        >
          <q-btn
            round
            push
            size="md"
            class="q-ml-md"
            color="primary"
            @click="onPrint"
          >
            <q-icon
              name="mdi-printer"
              color="primary"
            />
          </q-btn>
        </BulkPrintDialog>
        <q-btn
          round
          push
          size="md"
          class="q-ml-auto"
          @click="close"
          color="grey"
        >
          <q-icon
            name="mdi-close"
            color="grey"
          />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
} from 'vue'
import BulkUpdateDialog from 'src/components/Dialogs/BulkUpdateDialog/index.vue'
import BulkRemoveDialog from 'src/components/Dialogs/BulkRemoveDialog/index.vue'
import BulkPrintDialog from 'src/components/Dialogs/BulkPrintDialog/index.vue'
import { CAN_UPDATE_PRODUCT, CAN_REMOVE_PRODUCT } from 'src/permissions'

export default defineComponent({
  name: 'ProductControls',
  components: {
    BulkUpdateDialog,
    BulkRemoveDialog,
    BulkPrintDialog
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Панель управления'
    },
  },
  emits: ['on-finish-update', 'on-finish-remove', 'on-finish-print', 'on-close'],
  setup(_, { emit }) {
    function onFinishUpdate() {
      emit('on-finish-update')
    }

    function onFinishRemove() {
      emit('on-finish-remove')
    }

    function onFinishPrint() {
      emit('on-finish-print')
    }

    function close() {
      emit('on-close')
    }

    return {
      onFinishUpdate,
      onFinishRemove,
      onFinishPrint,
      close,
      CAN_UPDATE_PRODUCT,
      CAN_REMOVE_PRODUCT
    }
  }
})
</script>

<style lang="scss" scoped>
.product-controls {
  width: 100%;
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  left: 50%;
  bottom: -100%;
  transform: translateX(-50%);
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  transition: all 0.3s ease;
  z-index: 3000;
  border-top: 1px solid var(--border-color);

  &_title {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  &_wrap {
    width: 100%;
    max-width: 500px;
    display: flex;
    padding: 4px 20px;
  }

  &--shown {
    bottom: 0;
  }
}
</style>
