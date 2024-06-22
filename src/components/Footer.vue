<template>
  <nav class="menu block-bg flex items-center">
    <router-link class="router-link" :to="indexLink" exact v-vibrate>
      <q-icon name="mdi-home-outline" />
      <span>Главная</span>
    </router-link>
    <router-link class="router-link" :to="productsLink" v-vibrate>
      <q-icon name="mdi-cart-outline" />
      <span>Товары</span>
    </router-link>
    <q-btn
      color="primary"
      icon="mdi-plus"
      size="lg"
      round
      dense
      to="/create-product"
      v-vibrate
    />
    <router-link class="router-link" :to="statisticLink" v-vibrate>
      <q-icon name="mdi-chart-box-outline" />
      <span>Отчеты</span>
    </router-link>
    <router-link class="router-link" :to="bucketLink" v-vibrate>
      <q-icon name="mdi-basket-outline">
        <div v-if="hasInBucket" class="has-in-backet" />
      </q-icon>
      <span>Корзина</span>
    </router-link>
    <div v-if="offline" class="offline flex justify-between items-center">
      <span>Нет соединения с интернетом</span>
      <q-icon name="mdi-wifi-off" />
    </div>
  </nav>
</template>

<script>
import { defineComponent, computed, watch, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import useBucket from 'src/modules/useBucket'
import useSklads from 'src/modules/useSklads'

export default defineComponent({
  name: 'TheFooter',
  setup() {
    const { params } = useRoute()
    const { sklads } = useSklads()
    const { bucketProductsCount, loadBucketProducts } = useBucket()

    const offline = ref(false);

    const hasInBucket = computed(() => bucketProductsCount.value)
    const indexLink = computed(() => '/')
    const bucketLink = computed(() => '/bucket')
    const productsLink = computed(() => '/products')
    const statisticLink = computed(() => params?.skladId ? `/sklad/${params?.skladId}/statistic` : '/statistic')

    watch(sklads, (val) => {
      loadBucketProducts(
        null,
        {
          where: {
            sklad: val?.map(s => s.id)
          }
        },
        { fetchPolicy: 'network-only' }
      );
    });

    onMounted(() => {
      window.addEventListener('online', () => {
        offline.value = false;
      });
      
      window.addEventListener('offline', () => {
        offline.value = true;
      });
    });

    return {
      statisticLink,
      indexLink,
      productsLink,
      bucketLink,
      hasInBucket,
      offline
    }
  },
})
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
      transform: scale(1.1);
      opacity: 1;
    }
  }

  .offline {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0 4px;
    text-align: left;
    font-size: 10px;
    color: #000;
    background: var(--q-negative);
  }
}
</style>
