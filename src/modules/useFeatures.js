import { LocalStorage } from 'quasar'
import { ref } from 'vue'
import { FEATURE_FLAGS } from 'src/config'

// Simple feature flags storage using LocalStorage
// New flags must be added to DEFAULT_FLAGS and default to false
const DEFAULT_FLAGS = {
	voiceCreate: false,
}

const savedFlags = LocalStorage.getItem(FEATURE_FLAGS) || {}
const featureFlags = ref({
	...DEFAULT_FLAGS,
	...savedFlags,
})

function persistFlags() {
	LocalStorage.set(FEATURE_FLAGS, featureFlags.value)
}

function isEnabled(flagName) {
	return !!featureFlags.value?.[flagName]
}

function setFlag(flagName, value) {
	featureFlags.value = {
		...featureFlags.value,
		[flagName]: !!value,
	}
	persistFlags()
}

function toggleFlag(flagName) {
	setFlag(flagName, !isEnabled(flagName))
}

export default function useFeatures() {
	return {
		featureFlags,
		isEnabled,
		setFlag,
		toggleFlag,
	}
}


