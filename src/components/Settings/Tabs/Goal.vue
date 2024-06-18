<template>
  <div class="settings-goal">
    <h6 class="q-ma-none q-mb-sm text-subtitle1">Цель на год</h6>
    <InputPrice
      :model-value="goalValue"
      label="Сумма"
      hint="Отображается на главной странице склада"
      clear
      :rules="[val => val?.length || 'Обязательное поле']"
      @update:model-value="onUpdate"
    />
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  watch,
  toRefs
} from 'vue'
import InputPrice from 'src/components/InputPrice.vue'

export default defineComponent({
  name: 'SettingsGoal',
  components: {
    InputPrice,
  },
  props: {
    goal: {
      type: Number,
      default: null
    },
  },
  emits: ['on-update'],
  setup(props, { emit }) {
    const { goal } = toRefs(props)
    const goalValue = ref(goal.value)

    function onUpdate(v) {
      emit('on-update', v)
    }

    watch(goal, value => {
      goalValue.value = value
    }, { immediate: true })

    return {
      goalValue,
      onUpdate
    }
  }
})
</script>
