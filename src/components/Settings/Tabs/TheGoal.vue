<template>
  <div class="settings-goal">
    <TheDropdown
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
    </TheDropdown>
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  toRefs
} from 'vue'
import InputPrice from 'src/components/InputPrice.vue'
import TheDropdown from 'src/components/TheDropdown/TheDropdown.vue'

defineOptions({
  name: 'SettingsGoal'
})

const emit = defineEmits(['on-update'])

const props = defineProps({
  goal: {
    type: Number,
    default: null
  },
})
const { goal } = toRefs(props)
const goalValue = ref(goal.value)

function onUpdate(v) {
  emit('on-update', v)
}

watch(goal, value => {
  goalValue.value = value
}, { immediate: true })
</script>
