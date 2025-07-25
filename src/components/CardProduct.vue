<template>
  <div
    class="card-product block-bg"
    :id="id"
  >
    <div v-if="withDiscount" class="discount_has">C</div>
    <div v-if="isDiscountToday" class="discount_banner">
      Сегодня скидочный день
      <q-icon class="mdi mdi-alert-circle q-ml-auto" color="white" size="xs" />
    </div>
    <div class="flex column full-width">
      <div class="card-product_img">
        <q-img
          :src="image"
          spinner-size="md"
          spinner-color="grey"
          class="cursor-pointer"
          @click="$emit('open-image-preview')"
        />
      </div>
      <router-link
        class="card-product_content"
        :to="`/product/${id}`"
      >
        <div class="card-product_title">
          <span class="text-primary">#{{ id }}</span>
          <p v-if="name">{{ name }}</p>
          <p v-else><span>Не указано</span></p>
        </div>
        <div class="card-product_info">
          <div v-permissions="{ permissions: [READ_ORIGINAL_PRICE], skladId: sklad?.id }" class="card-product_price">
            <span>Опт цена</span>
            <p v-if="origPrice"><PriceFormatter :value="origPrice" /></p>
            <p v-else>n/a</p>
          </div>
          <div class="card-product_price">
            <span>Роз цена</span>
            <div v-if="newPrice" class="flex">
              <p :class="{ 'with-discount': isDiscountToday && withDiscount }"><PriceFormatter :value="newPrice" /></p>
              <p v-if="isDiscountToday && withDiscount"><PriceFormatter :value="discountPrice" /></p>
            </div>
            <p v-else>n/a</p>
          </div>
          <div class="card-product_color">
            <span>Цвет</span>
            <div
              v-if="color"
              :style="`background-color: ${color};`"
            />
            <div v-else>n/a</div>
          </div>
        </div>
        <div v-if="useNumberOfSizes" class="card-product_sizes">
          <span>Количество:</span>
          <p
            v-if="countSizes"
            class="text-primary"
          >
            {{ countSizes }} шт
          </p>
          <p v-else class="text-deep-orange">Не указано</p>
        </div>
        <div v-else class="card-product_sizes">
          <span>Размеры:</span>
          <SizeCount v-if="sizes && sizes.length" :sizes="sizes" />
          <p v-else class="text-deep-orange">Не указаны</p>
        </div>
      </router-link>
    </div>

    <div class="card-product_controls flex column items-center">
      <slot />
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import {
  computed,
  defineComponent,
  toRefs
} from 'vue'
import { FILTER_FORMAT } from 'src/config'
import { READ_ORIGINAL_PRICE } from 'src/permissions'
import PriceFormatter from 'src/components/PriceFormatter.vue'
import SizeCount from 'src/components/SizeCount.vue'

export default defineComponent({
  name: 'CardProduct',
  components: {
    PriceFormatter,
    SizeCount
  },
  props: {
    id: {
      type: String,
      default: null
    },
    sklad: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    origPrice: {
      type: Number,
      default: null
    },
    newPrice: {
      type: Number,
      default: null
    },
    discountPrice: {
      type: Number,
      default: null
    },
    discountDays: {
      type: Array,
      default: null
    },
    withDiscount: {
      type: Boolean,
      default: false
    },
    sizes: {
      type: Array,
      default: () => []
    },
    color: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    countSizes: {
      type: Number,
      default: null
    },
    useNumberOfSizes: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const TODAY = Date.now()
    const { discountDays } = toRefs(props)

    const isDiscountToday = computed(() => {
      return discountDays.value?.some(d => d === moment(TODAY).format(FILTER_FORMAT))
    })

    return {
      isDiscountToday,
      READ_ORIGINAL_PRICE
    }
  }
})
</script>

<style lang="scss" scoped>
.card-product {
  display: flex;
  position: relative;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);

  &_controls {
    width: 80px;
    padding: 15px 0;
    background-color: rgba(0, 0, 0, 0.02);
  }

  .discount_has {
    width: 25px;
    height: 25px;
    background-color: red;
    color: #fff;
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: 2;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    line-height: normal;
  }

  .discount_banner {
    width: 220px;
    background-color: red;
    color: #fff;
    position: absolute;
    top: 115px;
    left: 0;
    padding: 0 4px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;

    i {
      opacity: 0.6;
    }
  }

  p {
    margin-bottom: 0;
  }

  &_img {
    min-height: 125px;
    position: relative;
    display: flex;
    align-items: flex-start;
    
    .q-img {
      width: 220px;
      height: 125px;
      border-radius: var(--border-radius);
      object-fit: cover;
    }
  }

  &_content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 15px;
  }

  &_info {
    width: 100%;
    display: flex;
    justify-content: space-between;

    span {
      color: var(--text-description);
    }
  }

  &_title {
    display: flex;
    align-items: center;
    font-size: 18px;
    margin-bottom: 5px;

    > span {
      margin-right: 5px;
    }

    p {
      span {
        color: var(--text-description);
      }
    }
  }

  .with-discount {
    opacity: 0.3;
    margin-right: 4px;
    text-decoration: line-through;
  }

  &_color {
    span {
      color: var(--text-description);
    }
  
    > div {
      width: 32px;
      height: 16px;
      border-radius: 3px;
    }
    
    > div {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
      box-shadow: 0px 0px 6px 0 rgba(0, 0, 0, 0.2);
    }
  }

  &_sizes {
    display: flex;
    align-items: center;
    margin-top: 12px;

    > span {
      margin-right: 5px;
      color: var(--text-description);
    }
  }
}
</style>
