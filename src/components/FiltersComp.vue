<template>
  <q-pull-to-refresh
    @refresh="refresh"
    bg-color="dark"
    class="filters"
  >
    <div class="flex no-wrap flex-center q-mb-lg">
      <BtnBack
        class="q-mr-md"
      />
      
      <!-- Основное поле поиска -->
      <q-input
        v-model="selectedFilters.name_contains"
        outlined
        debounce="800"
        label="Умный поиск"
        class="full-width block-bg border-radius-sm"
        dense
        :autofocus="autofocus"
        clearable
        @update:model-value="search"
      >
        <template v-if="!selectedFilters.name_contains"  #append>
          <q-btn
            round
            dense
            color="primary"
            icon="mic"
            size="sm"
            @click="showVoiceOverlay = true"
            aria-label="Голосовой поиск"
          />
        </template>
      </q-input>
      
      <q-btn
        class="q-ml-md"
        push
        clearable
        round
        size="md"
        color="white"
        text-color="black"
        @click="leftDrawerOpen = true"
      >
        <q-icon
          name="mdi-filter-variant"
        />
        <div v-if="hasFilters" class="alert_dot" />
      </q-btn>
  
      <!-- Расширенные фильтры -->
      <FilterDialog
        v-model="leftDrawerOpen"
        :filters="selectedFilters"
        @apply="applyFilters"
        @clear="clear"
      />
  
      <VoiceOverlay 
        :model-value="showVoiceOverlay" 
        @cancel="showVoiceOverlay = false"
        @result="handleVoiceResult"
        @update:model-value="showVoiceOverlay = $event"
      />
    </div>
  </q-pull-to-refresh>
</template>

<script setup>
import {
  computed,
  ref,
  reactive,
} from 'vue'
import BtnBack from 'src/components/BtnBack.vue'
import FilterDialog from 'src/components/Dialogs/FilterDialog.vue'
import VoiceOverlay from './VoiceOverlay.vue'

const props = defineProps({
  autofocus: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['on-search', 'clear'])

const leftDrawerOpen = ref(false)
const showVoiceOverlay = ref(false)

const selectedFilters = reactive({
  color: null,
  colorName: null,
  colors: [],
  name_contains: null,
  withDiscount: false,
  priceFrom: null,
  priceTo: null,
  sizes: []
})

const hasFilters = computed(() => {
  return Object.keys(selectedFilters).some(key => {
    const value = selectedFilters[key]
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'boolean') return value
    return value !== null && value !== undefined && value !== ''
  })
})

function search() {
  const filters = {}
  if (selectedFilters.name_contains) {
    filters.name_contains = selectedFilters.name_contains
  }
  if (selectedFilters.colors?.length) {
    // Если выбран мультивыбор цветов, отправляем массив цветов в ключ "color"
    filters.color = selectedFilters.colors.map(c => c.color)
  } else if (selectedFilters.color) {
    // Для обратной совместимости - одиночный цвет
    filters.color = selectedFilters.color
  }
  if (selectedFilters.sizes?.length) {
    filters.sizes = selectedFilters.sizes
  }
  if (selectedFilters.priceFrom !== null) {
    filters.newPrice_gte = selectedFilters.priceFrom
  }
  if (selectedFilters.priceTo !== null) {
    filters.newPrice_lte = selectedFilters.priceTo
  }
  if (selectedFilters.withDiscount) {
    filters.withDiscount = selectedFilters.withDiscount
  }
  if (selectedFilters.lowStock) {
    filters.countSizes_lte = 5
  }
  if (selectedFilters.inStock) {
    filters.countSizes_gt = 0
  }
  emit('on-search', hasFilters.value ? { ...filters } : {})
}

function applyFilters(newFilters) {
  Object.assign(selectedFilters, newFilters)
  search()
}

function clear() {
  Object.keys(selectedFilters).forEach(key => {
    if (Array.isArray(selectedFilters[key])) {
      selectedFilters[key] = []
    } else if (typeof selectedFilters[key] === 'boolean') {
      selectedFilters[key] = false
    } else {
      selectedFilters[key] = null
    }
  })
  emit('clear')
  search()
}

function handleVoiceResult(text) {
  if (text && text.trim()) {
    selectedFilters.name_contains = text.trim()
    search()
  }
}

function refresh() {
  window.location.reload()
}
</script>

<style lang="scss" scoped>
.filters {
  position: sticky;
  top: 10px;
  z-index: 10;

  .alert_dot {
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background-color: red;
    position: absolute;
    right: 0px;
    top: 0px;
    transition: all 0.2s ease;
  }

  .pulse-animation {
    position: absolute;
    background-color: var(--deep-orange);
    border: 5px solid var(--deep-orange);
    border-radius: 50%;
    animation: pulsate infinite 1.5s;
  }

  @keyframes pulsate {
    0% {
      transform: scale(1, 1);
      opacity: 1;
    }
    100% {
      transform: scale(1.3, 1.3);
      opacity: 0;
    }
  }
}
.voice-overlay {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}
.voice-indicator {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pulse {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(33,150,243,0.2);
  animation: pulse-voice 1.2s infinite;
}
@keyframes pulse-voice {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
.voice-placeholder {
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 24px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>