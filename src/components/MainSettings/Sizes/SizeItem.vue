<template>
  <q-expansion-item
    v-model="expanded"
    :label="name"
  >
    <div class="flex no-wrap q-gap-sm items-start">
      <div class="flex flex-start items-center q-gap-sm q-my-sm q-px-md">
        <q-btn
          v-for="(s, i) of list"
          :key="i"
          color="primary"
          :label="s.size"
          :disable="disable"
          size="lg"
          outline
          v-vibrate
        />
      </div>
      <div class="flex q-ml-auto q-mr-md q-mt-sm">
        <q-btn @click="onEdit" icon="mdi-pencil" size="sm" round push color="primary" v-vibrate />
      </div>
    </div>
  </q-expansion-item>
</template>


<script>
import {
  defineComponent,
} from 'vue'

export default defineComponent({
  name: 'SizeItem',
  props: {
    name: {
      type: String,
      default: ''
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  emits: ['on-edit'],
  setup(_, { emit }) {
  
    function onEdit() {
      emit('on-edit')
    }

    return {
      onEdit
    }
  }
})
</script>
