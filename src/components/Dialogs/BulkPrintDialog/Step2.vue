<template>
  <div class="flex column q-gap-md">
    <q-separator />
    {{ $t('printing.templateExampleTitle') }}
    <div class="flex column bulk-print-example">
      <div class="bulk-print-example_block flex items-center justify-center column q-mx-auto">
        <span>{{ $t('product.priceName') }}</span>
        <QRCodeVue3
          value="Simple QR code"
          :width="80"
          :height="80"
          :dotsOptions="{
            type: 'dots',
            color: '#000'
          }"
        />
        <div class="flex">
          <span class="q-mr-xs">{{ $t('common.price') }}:</span><b>0000</b>
        </div>
      </div>
    </div>
    <q-separator />
    <div class="flex no-wrap sjustify-end q-gap-md">
      <q-btn
        style="width:100%;height:40px;"
        color="grey"
        icon="mdi-arrow-left"
        push
        @click="prev"
      />
      <q-btn
        style="width:100%;height:40px;"
        color="primary"
        icon="mdi-check"
        push
        :disable="isDisabled"
        @click="submit"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import QRCodeVue3 from 'qrcode-vue3';

export default defineComponent({
  name: 'BulkPrintStep2',
  components: {
    QRCodeVue3,
  },
  emits: ['on-prev', 'on-submit'],
  setup(_, { emit }) {

    function submit() {
      emit('on-submit')
    }
    function prev() {
      emit('on-prev')
    }

    return {
      prev,
      submit,
    }
  }
})
</script>

<style lang="scss" scoped>
.bulk-print-example {
  padding: 15px;
  background: #fff4cf;

  &_block {
    padding: 10px;
    border-radius: 10px;
    background: #fff;
    width: 100%;
    max-width: 250px;
    height: 150px;
  }
}
</style>