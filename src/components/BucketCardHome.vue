<template>
  <div class="bucket-section">
    <div class="bucket-card-header">
      <h6 class="text-subtitle1 q-mt-none q-mb-sm">{{ $t('bucket.orders') }}</h6>
    </div>
    <div class="bucket-card block-bg" @click="push('/bucket')" v-ripple>
      <div class="bucket-card-content">
        <div class="bucket-card-icon">
          <q-icon name="mdi-cart-outline" size="lg" />
          <div v-if="bucketProductsCount > 0" class="bucket-badge">
            {{ bucketProductsCount }}
          </div>
        </div>
        <div class="bucket-card-info">
          <h6 class="bucket-card-title">{{ $t('bucket.title') }}</h6>
          <p class="bucket-card-description">
            <span v-if="bucketProductsCount > 0">
              {{ bucketProductsCount }} {{ bucketProductsCount === 1 ? $t('bucket.item') : bucketProductsCount < 5 ? $t('bucket.items2') : $t('bucket.items5') }} {{ $t('bucket.inBucket') }}
            </span>
            <span v-else>
              {{ $t('bucket.emptyBasket') }}
            </span>
          </p>
        </div>
        <div class="bucket-card-arrow">
          <q-icon name="mdi-chevron-right" size="sm" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'BucketCardHome',
  props: {
    bucketProductsCount: {
      type: Number,
      default: 0
    }
  },
  setup() {
    const { push } = useRouter()

    return {
      push
    }
  }
})
</script>

<style lang="scss" scoped>
.bucket-section {
  width: 100%;
  max-width: 500px;
  padding: 0 16px;
  
  .bucket-card {
    width: 100%;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    &-content {
      display: flex;
      align-items: center;
      padding: 12px;
      gap: 16px;
    }
    
    &-icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      color: var(--text-description);
    }
    
    &-info {
      flex: 1;
      
      .bucket-card-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-black);
      }
      
      .bucket-card-description {
        margin: 0;
        font-size: 14px;
        color: var(--text-description);
        line-height: 1.4;
      }
    }
    
    &-arrow {
      color: var(--text-description);
      opacity: 0.6;
    }
  }
}

.bucket-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: red;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
}
</style> 