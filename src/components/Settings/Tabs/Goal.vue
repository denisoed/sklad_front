<template>
  <div class="settings-goal">
    <Dropdown
      class="q-mt-md"
      :title="$t('settings.goal.yearGoal')"
      opened
    >
      <template #body>
        <InputPrice
          :model-value="goalValue"
          :label="$t('settings.goal.amount')"
          :hint="$t('settings.goal.displayOnMainPage')"
          clear
          :rules="[val => val?.length || $t('common.requiredField')]"
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
import { useI18n } from 'vue-i18n'
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
