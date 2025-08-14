<template>
	<div class="q-mt-md">
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
	</div>
</template>

<script setup>
import { computed } from 'vue'
import TheDropdown from 'src/components/TheDropdown/TheDropdown.vue'
import useFeatures from 'src/modules/useFeatures'

defineOptions({
	name: 'ExperimentalTab',
})

const { isEnabled, setFlag } = useFeatures()

const voiceEnabled = computed({
	get: () => isEnabled('voiceCreate'),
	set: (val) => setFlag('voiceCreate', val),
})
</script>

<style lang="scss" scoped>
</style>


