<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="voice-create-wrapper">
        <VoiceOverlay
          v-if="showVoiceOverlay"
          :auto-close="false"
          :throttle-ms="1000"
          @result="onVoiceResult"
          @close="close"
        >
          <template #header>
            <!-- Helper panel with checkpoints -->
            <div class="helper-panel block-bg border-radius-md with-bg q-mb-md q-pa-md">
              <div class="helper-header flex items-center">
                <q-icon name="mdi-microphone" color="primary" size="sm" class="q-mr-sm" />
                <div class="text-subtitle2 text-weight-bold">{{ title }}</div>
                <q-space />
                <q-btn
                  push
                  round
                  size="sm"
                  dense
                  icon="mdi-information-outline"
                  @click="toggleInfo"
                />
              </div>

              <div v-if="showInfo" class="flex column q-gap-sm q-mt-md">
                <div class="text-body2">{{ $t('voiceCreate.hint') }}</div>
                <div class="text-caption text-grey-6">{{ $t('voiceCreate.sayKeys') }}</div>
              </div>
              
              <div v-else ref="checkpointsRef" class="voice-create-checkpoints q-gutter-y-sm q-mt-md q-pb-xs">
                <div
                  v-for="cp in visibleCheckpoints"
                  :key="cp.key"
                  class="checkpoint flex items-center q-px-sm q-py-xs border-radius-sm"
                  :class="[
                    { done: !!parsed[cp.key] },
                    cp.key === 'sklad' ? { error: skladError && !parsed[cp.key] } :
                    (cp.key === 'category' ? { error: categoryError && !parsed[cp.key] } : {})
                  ]"
                >
                  <q-icon :name="parsed[cp.key] ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline'" :color="parsed[cp.key] ? 'primary' : 'grey-6'" size="18px" class="q-mr-sm" />
                  <div class="ellipsis">
                    <span class="text-weight-medium">{{ cp.title }}</span>
                    <span v-if="parsed[cp.key]" class="text-grey-6">: {{ parsed[cp.key] }}</span>
                  </div>
                </div>
              </div>

              <div class="flex no-wrap q-mt-lg q-gap-md">
                <q-btn
                  color="grey"
                  icon="mdi-refresh"
                  push
                  :disable="!isDirty"
                  @click="reset"
                />
                <q-btn
                  color="primary"
                  class="full-width"
                  :label="$t('common.confirm')"
                  :disable="!isDirty || isSubmitting"
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
import { ref, reactive, watch, computed, nextTick } from 'vue'
import Fuse from 'fuse.js'
import { useI18n } from 'vue-i18n'
import useCategories from 'src/modules/useCategories'
import useSklads from 'src/modules/useSklads'
import VoiceOverlay from 'src/components/VoiceOverlay.vue'
import { COLORS } from 'src/modules/useColors'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  product: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'apply'])

const { t, tm } = useI18n({ useScope: 'global' })
const { sklads } = useSklads()
const { allUserCategories } = useCategories()

const showVoiceOverlay = ref(true)
const isSubmitting = ref(false)
const recognizedText = ref('')
const showInfo = ref(false)
const selectedSkladId = ref(null)
const skladError = ref(false)
const categoryError = ref(false)

// Minimal set of checkpoints for MVP. Only name will be applied per task requirements
const getSynonyms = (path) => {
  const value = tm(path)
  return Array.isArray(value) ? value.map((s) => String(s).toLowerCase()) : []
}

const checkpoints = [
  { key: 'sklad', title: t('common.warehouse'), synonyms: getSynonyms('fuzy.warehouse') },
  { key: 'category', title: t('common.category'), synonyms: getSynonyms('fuzy.category') },
  { key: 'name', title: t('common.name'), synonyms: getSynonyms('fuzy.name') },
  { key: 'color', title: t('common.color'), synonyms: getSynonyms('fuzy.color') },
  { key: 'origPrice', title: t('product.originalPrice'), synonyms: getSynonyms('fuzy.wholesalePrice') },
  { key: 'newPrice', title: t('product.retailPrice'), synonyms: getSynonyms('fuzy.retailPrice') },
  { key: 'countSizes', title: t('common.quantity'), synonyms: getSynonyms('fuzy.quantity') },
]

const parsed = reactive({
  sklad: '',
  category: '',
  name: '',
  color: '',
  origPrice: '',
  newPrice: '',
  countSizes: '',
})

const isDirty = computed(() => {
  return Object.keys(parsed).some((key) => parsed[key] !== '')
})

// Hide category checkpoint until warehouse is set
const visibleCheckpoints = computed(() => {
  if (!parsed.sklad) {
    return checkpoints.filter((c) => c.key !== 'category')
  }
  return checkpoints
})

// Auto scroll to bottom when first five fields are filled
const checkpointsRef = ref(null)
const isFirstFiveFilled = computed(() => {
  const keys = ['sklad', 'category', 'name', 'color', 'origPrice']
  const filledCount = keys.reduce((acc, k) => acc + (parsed[k] !== '' ? 1 : 0), 0)
  return filledCount >= 4
})

watch(isFirstFiveFilled, async (filled) => {
  if (filled && !showInfo.value) {
    await nextTick()
    const el = checkpointsRef.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }
})

function close() {
  emit('update:modelValue', false)
}

function reset() {
  Object.assign(parsed, { sklad: '', category: '', name: '', color: '', origPrice: '', newPrice: '', countSizes: '' })
  selectedSkladId.value = null
  skladError.value = false
  categoryError.value = false
}

function toggleInfo() {
  showInfo.value = !showInfo.value
}

function onVoiceResult(text) {
  recognizedText.value = (text || '').trim()
  const next = extractFields(recognizedText.value)

  // Apply sklad first and reset category if sklad changed
  if (next.sklad) {
    const match = matchSkladByName(next.sklad)
    if (match?.id) {
      parsed.sklad = match.name
      selectedSkladId.value = match.id
      parsed.category = ''
      skladError.value = false
      categoryError.value = false
    } else {
      // Clear current value and mark as error if not found
      parsed.sklad = ''
      selectedSkladId.value = null
      skladError.value = true
      selectedSkladId.value = null
      parsed.category = ''
      categoryError.value = false
    }
  }

  // Apply remaining fields (category may come in same utterance)
  Object.keys(next).forEach((key) => {
    if (key === 'sklad') return
    // Do not allow setting category before warehouse is set
    if (key === 'category') {
      if (!parsed.sklad || !selectedSkladId.value) return
      const match = matchCategoryByName(next.category, selectedSkladId.value)
      if (match?.id) {
        parsed.category = match.name
        categoryError.value = false
      } else {
        // Clear current value and mark as error if not found
        parsed.category = ''
        categoryError.value = true
      }
      return
    }
    if (next[key]) parsed[key] = next[key]
  })
}

function initializeFromProduct() {
  const p = props.product || {}
  const findNameById = (refList, id) => {
    const arr = Array.isArray(refList?.value) ? refList.value : (Array.isArray(refList) ? refList : [])
    const item = arr.find((x) => x?.id === id)
    return item?.name || ''
  }

  const skladName = p?.sklad ? findNameById(sklads, p.sklad) : ''
  const categoryName = p?.category ? findNameById(allUserCategories, p.category) : ''
  const countSizesNum = Number(p?.countSizes)
  const colorKey = COLORS.find(c => c.color === p?.color)?.nameKey

  Object.assign(parsed, {
    sklad: skladName || '',
    category: categoryName || '',
    name: p?.name ? String(p.name).trim() : '',
    color: colorKey ? t(colorKey) : '',
    origPrice: p?.origPrice != null && p.origPrice !== '' ? String(p.origPrice) : '',
    newPrice: p?.newPrice != null && p.newPrice !== '' ? String(p.newPrice) : '',
    countSizes: Number.isFinite(countSizesNum) && countSizesNum > 0 ? String(countSizesNum) : '',
  })
  selectedSkladId.value = p?.sklad || null
  skladError.value = false
  categoryError.value = false
}

// Very lightweight ru-text parser: "key ... value"; stops value on next known key word
function extractFields(text) {
  const result = {}
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
    // Normalize separators globally, trim
    let value = slice.replace(/[\:\-–—]/g, ' ').trim()
    if (value) {
      // If value actually starts with another known key synonym, treat as empty (no value provided)
      const cleanStart = value.toLowerCase().replace(/^[\s\:\-–—]+/, '')
      const startsWithOtherKey = allSynonyms.some(({ key: otherKey, s: synonym }) =>
        otherKey !== key && cleanStart.startsWith(synonym)
      )
      if (startsWithOtherKey) {
        continue
      }
      if (key === 'countSizes') {
        const num = extractInteger(value)
        if (num != null) result[key] = String(num)
      } else if (key === 'origPrice' || key === 'newPrice') {
        const price = extractPrice(value)
        if (price != null) result[key] = String(price)
      } else {
        result[key] = value
      }
    }
  }

  // No fallback behavior: values are set only if spoken with explicit key synonyms

  return result
}

function matchSkladByName(value) {
  const normalize = (str) => String(str || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .trim()
  const list = (sklads.value || []).map((x) => ({ ...x, _n: normalize(x?.name) }))
  const fuse = new Fuse(list, { includeScore: true, threshold: 0.4, ignoreLocation: true, keys: ['_n'] })
  const [first] = fuse.search(normalize(value))
  return first?.item
}

function matchCategoryByName(value, skladId) {
  const normalize = (str) => String(str || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .trim()
  const available = (allUserCategories.value || []).filter((x) => x?.sklad?.id === skladId)
  const list = available.map((x) => ({ ...x, _n: normalize(x?.name) }))
  const fuse = new Fuse(list, { includeScore: true, threshold: 0.4, ignoreLocation: true, keys: ['_n'] })
  const [first] = fuse.search(normalize(value))
  return first?.item
}

function extractInteger(str) {
  if (!str) return null
  const match = String(str).replace(/\s+/g, ' ').match(/(\d{1,7})(?:[\,\.](\d+))?/)
  if (!match) return null
  const intPart = match[1]
  // We expect integer quantities for countSizes
  const num = parseInt(intPart, 10)
  return Number.isFinite(num) && num >= 0 ? num : null
}

function extractPrice(str) {
  if (!str) return null
  // Find first number with optional decimal part; allow spaces as thousands separators
  const normalized = String(str)
    .replace(/[^0-9.,\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const match = normalized.match(/(\d[\d\s]{0,12})([\.,](\d{1,2}))?/)
  if (!match) return null
  const integerPart = match[1].replace(/\s+/g, '')
  const decimalPart = match[3] || ''
  const asNumber = parseFloat(decimalPart ? `${integerPart}.${decimalPart}` : integerPart)
  return Number.isFinite(asNumber) && asNumber >= 0 ? asNumber : null
}

async function prepareData(data) {
  const normalize = (str) =>
    String(str || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .trim()

  const fuseOptions = {
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    keys: ['_n']
  }

  const result = {}

  if (data?.name) {
    result.name = String(data.name).trim()
  }

  if (data?.origPrice !== undefined && data?.origPrice !== null && String(data.origPrice).trim() !== '') {
    result.origPrice = String(data.origPrice).trim()
  }

  if (data?.newPrice !== undefined && data?.newPrice !== null && String(data.newPrice).trim() !== '') {
    result.newPrice = String(data.newPrice).trim()
  }

  if (data?.countSizes) {
    const num = Number(data.countSizes)
    if (Number.isFinite(num)) result.countSizes = num
  }

  if (data?.sklad && sklads?.value?.length) {
    const list = (sklads.value || []).map((x) => ({ ...x, _n: normalize(x?.name) }))
    const fuse = new Fuse(list, fuseOptions)
    const q = normalize(data.sklad)
    const [first] = fuse.search(q)
    const match = first?.item
    if (match?.id) {
      result.sklad = match.id
      // Keep for category filtering if needed
      selectedSkladId.value = match.id
    }
  }

  if (data?.category && allUserCategories?.value?.length && result.sklad) {
    // If sklad resolved, filter categories by selected warehouse
    const selectedSkladId = result.sklad || null
    const availableCategories = (allUserCategories.value || []).filter((x) =>
      selectedSkladId ? x?.sklad?.id === selectedSkladId : true
    )
    const list = availableCategories.map((x) => ({ ...x, _n: normalize(x?.name) }))
    const fuse = new Fuse(list, fuseOptions)
    const q = normalize(data.category)
    const [first] = fuse.search(q)
    const match = first?.item
    if (match?.id) {
      result.category = match.id
    }
  }

  // Color fuzzy by localized name of COLORS.nameKey
  if (data?.color) {
    const list = (COLORS || []).map((x) => ({ ...x, _n: normalize(t(x?.nameKey)), _label: t(x?.nameKey) }))
    const fuse = new Fuse(list, fuseOptions)
    const q = normalize(data.color)
    const [first] = fuse.search(q)
    const match = first?.item
    if (match?.color) {
      result.color = match.color
      result.colorName = t(match.nameKey)
    }
  }

  return result
}

async function confirm() {
  isSubmitting.value = true
  try {
    const payload = await prepareData(parsed)
    emit('apply', payload)
    close()
  } catch (e) {
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      showVoiceOverlay.value = true
      recognizedText.value = ''
      initializeFromProduct()
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
  background: rgba(0, 0, 0, 0.90);
  color: #fff;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.12);
}

.voice-create-checkpoints {
  max-height: 220px;
  overflow-y: auto;
}

.checkpoint {
  border: 1px dashed var(--border-color);
  &.done {
    border-color: var(--q-primary);
    background: rgba(25, 118, 210, 0.06);
  }
  &.error {
    border-color: #e53935;
    background: rgba(229, 57, 53, 0.06);
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

