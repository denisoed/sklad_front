<template>
  <div class="settings-goal">
    <Dropdown
      class="q-mt-md"
      title="Цель на год"
      opened
    >
      <template #body>
        <InputPrice
          :model-value="goalValue"
          label="Сумма"
          hint="Отображается на главной странице склада"
          clear
          :rules="[val => val?.length || 'Обязательное поле']"
          @update:model-value="onUpdate"
        />
      </template>
    </Dropdown>
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
import Dropdown from 'src/components/Dropdown/index.vue'

export default defineComponent({
  name: 'SettingsGoal',
  components: {
    InputPrice,
    Dropdown,
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
