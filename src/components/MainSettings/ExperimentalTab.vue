<template>
	<div class="flex column q-gap-md">
		<h6 class="text-subtitle2 text-grey-5 q-my-none">
			{{ $t('mainSettings.experimentalTab.description') }}
		</h6>
		<TheDropdown
			:title="$t('mainSettings.experimentalTab.voiceCreate.title')"
		>
      <template #icon>
        <q-icon name="mdi-microphone" size="sm" class="q-mr-sm" />
      </template>
			<template #body>
				<p class="text-body2 q-mb-md text-grey-5" v-html="$t('mainSettings.experimentalTab.voiceCreate.description')" />
				<div class="flex items-center">
					<q-toggle
						v-model="voiceEnabled"
						color="primary"
						:label="voiceEnabled ? $t('mainSettings.experimentalTab.enabled') : $t('mainSettings.experimentalTab.disabled')"
					/>
				</div>
			</template>
		</TheDropdown>

		<TheDropdown :title="$t('mainSettings.experimentalTab.theme.title')">
      <template #icon>
        <q-icon name="mdi-theme-light-dark" size="sm" class="q-mr-sm" />
      </template>
      <template #body>
        <label class="flex items-center cursor-pointer">
          <q-icon name="mdi-moon-waxing-crescent mdi-rotate-45" class="q-mr-md" />
          <span>{{ $t('mainSettings.experimentalTab.theme.dark')}}</span>
          <q-toggle v-model="isDark" class="q-ml-auto" />
        </label>
      </template>
    </TheDropdown>
	</div>
</template>

<script setup>
import { computed, watch } from 'vue'
import TheDropdown from 'src/components/TheDropdown/TheDropdown.vue'
import useFeatures from 'src/modules/useFeatures'
import useTheme from 'src/modules/useTheme'

defineOptions({
	name: 'ExperimentalTab',
})

const { isEnabled, setFlag } = useFeatures()
const { toggleTheme, isDark } = useTheme();

const voiceEnabled = computed({
	get: () => isEnabled('voiceCreate'),
	set: (val) => setFlag('voiceCreate', val),
})

watch(isDark, () => {
  toggleTheme()
})
</script>

<style lang="scss" scoped>
</style>


