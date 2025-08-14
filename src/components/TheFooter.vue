<template>
  <nav class="menu block-bg flex items-center">
    <router-link class="router-link" :to="indexLink" exact>
      <q-icon name="mdi-home-outline" />
      <span>{{ $t('footer.home') }}</span>
    </router-link>
    <router-link class="router-link" :to="productsLink">
      <q-icon name="mdi-cube-outline" />
      <span>{{ $t('footer.products') }}</span>
    </router-link>
    <q-btn
      color="primary"
      :icon="isMenuOpen ? 'mdi-close' : 'mdi-plus'"
      size="lg"
      round
      dense
      v-tour="CREATE_NEW_BUTTON"
      @click="toggleMenu"
      :class="{ 'rotate-45': isMenuOpen }"
    />
    <router-link class="router-link" :to="statisticLink">
      <q-icon name="mdi-chart-box-outline" />
      <span>{{ $t('footer.statistic') }}</span>
    </router-link>
    <router-link class="router-link" :to="bucketLink">
      <q-icon name="mdi-cart-outline">
        <div v-if="hasInBucket" class="has-in-backet" />
      </q-icon>
      <span>{{ $t('footer.bucket') }}</span>
    </router-link>
  </nav>

  <!-- Blur backdrop -->
  <template v-if="isMenuOpen">
    <div 
      class="blur-backdrop"
      @click="closeMenu"
    >
      <q-btn
        color="negative"
        icon="mdi-close"
        round
        dense
        class="absolute-top-right q-ma-md"
        @click="closeMenu"
      />
    </div>
  
    <!-- Floating action buttons -->
    <div class="floating-menu">
      <div 
        v-for="(action, index) in actions" 
        :key="action.id"
        class="floating-btn"
        :style="{ 
          '--delay': `${(actions.length - 1 - index) * 0.03}s`,
          '--index': actions.length - 1 - index
        }"
      >
        <span class="action-label">{{ action.label }}</span>
        <q-btn
          color="primary"
          :icon="action.icon"
          round
          size="md"
          class="action-btn"
          :disabled="action.disabled"
          @click="handleActionClick(action)"
        />
      </div>
    </div>
  </template>
</template>

<script setup>
import { computed, watch, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useBucket from 'src/modules/useBucket'
import useSklads from 'src/modules/useSklads'
import { useBucketStore } from 'src/stores/bucket'
import useEventBus from 'src/modules/useEventBus'
import { MANAGE_SKLAD_DIALOG, MANAGE_CATEGORY_DIALOG } from 'src/config/dialogs'
import useDialog from 'src/modules/useDialog'
import { useI18n } from 'vue-i18n'
import { CREATE_NEW_BUTTON } from 'src/config/tour'

defineOptions({
  name: 'TheFooter'
})

const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()
const { sklads } = useSklads()
const { loadBucketProducts } = useBucket()
const bucketStore = useBucketStore()
const { emitBus, BUS_EVENTS } = useEventBus()
const { openDialog } = useDialog()

// Menu state
const isMenuOpen = ref(false)

// Check if user is on product page
const isOnProductPage = computed(() => {
  return route.name === 'ProductPage' || 
          route.path.includes('/product/') ||
          (route.path.includes('/products/') && route.params.id)
})

const CREATE_SKLAD_ID = 'create-sklad'
const CREATE_CATEGORY_ID = 'create-category'
const CREATE_PRODUCT_ID = 'create-product'
const DUPLICATE_PRODUCT_ID = 'duplicate-product'

// Base actions
const baseActions = [
  {
    id: CREATE_SKLAD_ID,
    icon: 'mdi-warehouse',
    label: $t('warehouse.create'),
    disabled: false
  },
  {
    id: CREATE_CATEGORY_ID,
    icon: 'mdi-folder-outline',
    label: $t('category.create'),
    disabled: false
  },
  {
    id: CREATE_PRODUCT_ID,
    icon: 'mdi-cube-outline',
    label: $t('product.create'),
    disabled: false
  }
]

const duplicateAction = {
  id: DUPLICATE_PRODUCT_ID,
  icon: 'mdi-content-duplicate',
  label: $t('product.duplicate'),
  disabled: false
}

// Actions for floating menu - computed to reactively include/exclude duplicate button
const actions = computed(() => {
  return isOnProductPage.value 
    ? [...baseActions, duplicateAction]
    : baseActions
})

// Use store directly for reactive updates
const hasInBucket = computed(() => bucketStore.getBucketProductsCount > 0)

const indexLink = computed(() => '/')
const bucketLink = computed(() => '/bucket')
const productsLink = computed(() => '/products')
const statisticLink = computed(() => route.params?.skladId ? `/sklad/${route.params?.skladId}/statistic` : '/statistic')

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleActionClick(action) {
  if (action.id === DUPLICATE_PRODUCT_ID) {
    emitBus(BUS_EVENTS.DUPLICATE_PRODUCT)
  }

  if (action.id === CREATE_SKLAD_ID) {
    openDialog(MANAGE_SKLAD_DIALOG)
  }

  if (action.id === CREATE_CATEGORY_ID) {
    openDialog(MANAGE_CATEGORY_DIALOG)
  }

  if (action.id === CREATE_PRODUCT_ID) {
    router.push('/create-product')
  }
  closeMenu()
}

function loadBucketData() {
  if (sklads.value?.length) {
    loadBucketProducts(
      null,
      {
        where: {
          sklad: sklads.value.map(s => s.id)
        }
      },
      { fetchPolicy: 'network-only' }
    );
  }
}

watch(sklads, (val) => {
  if (val?.length) {
    loadBucketData();
  }
}, { immediate: true });

// Close menu when route changes
watch(route, () => {
  closeMenu();
});

// Force load bucket data on mount if sklads are already available
onMounted(() => {
  if (sklads.value?.length && bucketStore.getBucketProductsCount === 0) {
    loadBucketData();
  }
});
</script>

<style lang="scss" scoped>
.menu {
  width: 100%;
  height: 86px;
  overflow: hidden;
  position: relative;
  box-shadow: var(--box-shadow);
  padding-bottom: 16px;
  z-index: 10;
  border-top: 1px solid var(--border-color);
  
  .router-link {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    flex: 1;
    color: var(--text-black);
    font-size: 12px;
    cursor: pointer;
    padding: 4px 12px;
    text-align: center;
    z-index: 10;
    
    i,
    span {
      -webkit-transition: all .2s ease-in-out 0s;
      transition: all .2s ease-in-out 0s;
      opacity: 0.8;
    }
  
    i {
      font-size: 20px;
    }
  }

  .q-btn {
    margin: 10px;
    transition: transform 0.3s ease;

    &.rotate-45 {
      transform: rotate(90deg);
    }
  }

  .q-icon {
    position: relative;
  }

  .has-in-backet {
    width: 5px;
    height: 5px;
    border-radius: 100%;
    background: var(--q-negative);
    position: absolute;
    top: 0;
    right: 0;
  }

  .router-link-exact-active {
    i,
    span {
      color: var(--q-primary-text);
      opacity: 1;
    }
  }
}

// Blur backdrop
.blur-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 5;
  animation: fadeIn 0.3s ease;
}

// Floating menu
.floating-menu {
  position: fixed;
  right: 16px;
  bottom: 110px;
  z-index: 15;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.floating-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transform: translateX(100px);
  animation: slideInRight 0.25s ease forwards;
  animation-delay: calc(var(--delay) + (var(--index) * 0.03s));

  .action-btn {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease;
  }

  .action-label {
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 400;
    white-space: nowrap;
    opacity: 0.8;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
}

// Animations
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// Dark theme support
body.body--dark {
  .floating-btn .action-label {
    background: rgba(255, 255, 255, 0.9);
    color: var(--q-dark);
  }
}
</style>
