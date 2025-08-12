<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="voice-create-wrapper">
        <VoiceOverlay
          v-if="showVoiceOverlay"
          :auto-close="false"
          @result="onVoiceResult"
          @close="close"
        >
          <template #header>
            <!-- Helper panel with checkpoints -->
            <div class="helper-panel block-bg border-radius-md with-bg q-mb-md q-pa-md">
              <div class="helper-header flex items-center q-pb-sm">
                <q-icon name="mdi-microphone" color="primary" size="sm" class="q-mr-sm" />
                <div class="text-subtitle2 text-weight-bold">{{ $t('voiceCreate.title') }}</div>
              </div>

              <div class="text-body2 q-mb-sm">{{ $t('voiceCreate.hint') }}</div>

              <div class="q-mb-sm text-caption text-grey-6">{{ $t('voiceCreate.sayKeys') }}</div>
              
              <div class="q-gutter-y-sm q-mb-sm">
                <div
                  v-for="cp in checkpoints"
                  :key="cp.key"
                  class="checkpoint flex items-center q-px-sm q-py-xs border-radius-sm"
                  :class="{ done: !!parsed[cp.key] }"
                >
                  <q-icon :name="parsed[cp.key] ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline'" :color="parsed[cp.key] ? 'primary' : 'grey-6'" size="18px" class="q-mr-sm" />
                  <div class="ellipsis">
                    <span class="text-weight-medium">{{ cp.title }}</span>
                    <span v-if="parsed[cp.key]" class="text-grey-6">: {{ parsed[cp.key] }}</span>
                  </div>
                </div>
              </div>

              <div class="flex no-wrap">
                <q-btn
                  color="primary"
                  class="full-width"
                  :label="$t('common.confirm')"
                  :disable="!parsed.name || isSubmitting"
                  :loading="isSubmitting"
                  push
                  @click="confirm"
                />
              </div>
            </div>
          </template>
        </VoiceOverlay>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VoiceOverlay from 'src/components/VoiceOverlay.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'apply'])

const { t } = useI18n({ useScope: 'global' })

const showVoiceOverlay = ref(true)
const isSubmitting = ref(false)
const recognizedText = ref('')

// Minimal set of checkpoints for MVP. Only name will be applied per task requirements
const checkpoints = [
  { key: 'warehouse', title: t('common.warehouse'), synonyms: ['склад'] },
  { key: 'category', title: t('common.category'), synonyms: ['категория'] },
  { key: 'name', title: t('common.name'), synonyms: ['название', 'наименование', 'имя'] },
]

const parsed = reactive({
  warehouse: '',
  category: '',
  name: '',
})

function close() {
  emit('update:modelValue', false)
}

function onVoiceResult(text) {
  recognizedText.value = (text || '').trim()
  Object.assign(parsed, extractFields(recognizedText.value))
}

// Very lightweight ru-text parser: "ключ ... значение"; stops value on next known key word
function extractFields(text) {
  const result = { warehouse: '', category: '', name: '' }
  if (!text) return result

  const allSynonyms = checkpoints.flatMap((c) => c.synonyms.map((s) => ({ key: c.key, s })))
  const order = allSynonyms
    .map(({ key, s }) => ({ key, s, idx: text.toLowerCase().indexOf(s) }))
    .filter((x) => x.idx >= 0)
    .sort((a, b) => a.idx - b.idx)

  for (let i = 0; i < order.length; i++) {
    const { key, s, idx } = order[i]
    const nextIdx = i + 1 < order.length ? order[i + 1].idx : text.length
    const slice = text.slice(idx + s.length, nextIdx)
    const value = slice.replace(/[\:\-–—]/, ' ').trim().replace(/^\s+|\s+$/g, '')
    if (value) {
      result[key] = value
    }
  }

  // Fallback: if only a phrase said without keys, consider it as name
  if (!result.name && !result.category && !result.warehouse) {
    result.name = text
  }

  return result
}

async function confirm() {
  if (!parsed.name) return
  isSubmitting.value = true
  try {
    // Mocked server request as required: returns only name
    const payload = await mockServer(parsed)
    emit('apply', payload)
    close()
  } catch (e) {
    // no-op for mock
  } finally {
    isSubmitting.value = false
  }
}

function mockServer(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: data.name })
    }, 350)
  })
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      showVoiceOverlay.value = true
      recognizedText.value = ''
      Object.assign(parsed, { warehouse: '', category: '', name: '' })
    }
  }
)
</script>

<style scoped lang="scss">
.helper-panel {
  width: min(92vw, 440px);
  background: var(--bg-color);
  color: var(--text-black);
  box-shadow: 0 6px 20px rgba(0,0,0,.25);
  z-index: 10;
}

.helper-panel.with-bg {
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.12);
}

.checkpoint {
  border: 1px dashed var(--border-color);
  &.done {
    border-color: var(--q-primary);
    background: rgba(25, 118, 210, 0.06);
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

