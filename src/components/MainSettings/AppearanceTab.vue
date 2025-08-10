<template>
  <div class="appearance-tab flex column q-gap-md">
    <TheDropdown :title="$t('mainSettings.appearanceTab.accentColors.title')">
      <template #icon>
        <q-icon name="mdi-palette" size="sm" class="q-mr-sm" />
      </template>
      <template #body>
        <div class="flex column">
          <p class="q-ma-none text-grey-2 text-caption q-mb-md">
            {{ $t('mainSettings.appearanceTab.accentColors.description') }}
          </p>
          <div class="color-grid">
            <div 
              v-for="(color, index) in ACCENT_COLORS" 
              :key="index"
              class="color-option cursor-pointer"
              :class="{ 'selected': selectedColor === color.value }"
              @click="selectColor(color)"
            >
              <div 
                class="color-circle"
                :style="{ backgroundColor: color.value }"
              ></div>
              <span class="color-name">{{ $t(`colors.accent.${color.name}`) }}</span>
              <q-icon 
                v-if="selectedColor === color.value" 
                name="mdi-check" 
                size="sm" 
                class="check-icon"
              />
            </div>
          </div>
        </div>
      </template>
    </TheDropdown>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted
} from 'vue'
import { LocalStorage } from 'quasar'
import TheDropdown from 'src/components/TheDropdown/TheDropdown.vue'
import useTheme from 'src/modules/useTheme'
import { ACCENT_COLORS, ACCENT_COLOR } from 'src/config'

const { setAccentColor } = useTheme()

const selectedColor = ref(ACCENT_COLORS[0].value)

function selectColor(color) {
  selectedColor.value = color.value
  setAccentColor(color.value, color.rgb)
  LocalStorage.set(ACCENT_COLOR, { value: color.value, rgb: color.rgb })
}

onMounted(() => {
  const savedColor = LocalStorage.getItem(ACCENT_COLOR)
  if (savedColor) {
    selectedColor.value = savedColor.value
    setAccentColor(savedColor.value, savedColor.rgb)
  }
})
</script>

<style lang="scss" scoped>
.appearance-tab {
  .color-grid {
    display: grid;
    gap: 12px;
  }

  .color-option {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: var(--border-radius-sm);
    border: 2px solid transparent;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      background-color: var(--q-dark-page, rgba(0, 0, 0, 0.05));
    }

    &.selected {
      border-color: var(--q-primary);
      background-color: rgba(var(--q-primary-rgb), 0.1);
    }

    .color-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 12px;
      border: 2px solid rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }

    .color-name {
      flex: 1;
      font-size: 14px;
    }

    .check-icon {
      color: var(--q-primary);
      margin-left: 8px;
    }
  }
}
</style> 