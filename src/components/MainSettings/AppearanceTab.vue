<template>
  <div class="appearance-tab flex column q-gap-md">
    <Dropdown :title="$t('mainSettings.appearanceTab.accentColors.title')">
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
              <span class="color-name">{{ color.name }}</span>
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
    </Dropdown>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  onMounted
} from 'vue'
import { LocalStorage } from 'quasar'
import Dropdown from 'src/components/Dropdown/index.vue'
import useTheme from 'src/modules/useTheme'
import { ACCENT_COLORS, ACCENT_COLOR } from 'src/config'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'AppearanceTab',
  components: {
    Dropdown
  },
  setup() {
    const { t: $t } = useI18n({ useScope: 'global' })
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

    return {
      selectedColor,
      selectColor,
      ACCENT_COLORS
    }
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