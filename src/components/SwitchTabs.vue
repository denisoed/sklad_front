<template>
  <div v-if="tabs?.length" class="tab-slider--tabs block-bg">
    <div
      v-for="(t, i) of tabs"
      :key="i"
      class="tab-slider--trigger"
      :class="{ 'active': i === selected }"
      :style="{
        width: `${100 / tabs.length}%`,
      }"
      @click="onClick(i, t.value)"
    >
      {{ t.label }}
      <q-icon v-if="t.icon" :name="t.icon" />
    </div>
    <div
      class="tab-bg"
      :style="{
        width: `${100 / tabs.length}%`,
        left: `${(100 / tabs.length) * selected}%`
      }"
    />
  </div>
</template>

<script>
import {
  defineComponent,
  ref
} from 'vue'

export default defineComponent({
  name: 'SwitchTabs',
  props: {
    tabs: {
      type: Array,
      default: () => []
    },
    selectedTab: {
      type: Number,
      default: 0,
    }
  },
  setup(props, { emit }) {
    const selected = ref(props.selectedTab)

    function onClick(index, value) {
      selected.value = index
      emit('on-change', value)
    }

    return {
      selected,
      onClick
    }
  }
})
</script>

<style lang="scss" scoped>
$tab-height: 35px;
$tab-border-radius: 35px;

.tab-slider--tabs {
  width: auto;
  display: flex;
  flex-wrap: nowrap;
	position: relative;
	border-radius: $tab-border-radius;
	overflow: hidden;
	height: $tab-height;
	user-select: none;
  box-shadow: var(--box-shadow);

  @media screen and (max-width: 476px) {
    width: 100%;
  }
}

.tab-bg {
  background: var(--q-primary);
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  transition: all 250ms ease-in-out;
  border-radius: $tab-border-radius;
}

.tab-slider--trigger {
  min-width: 80px;
	position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: normal;
	font-size: 12px;
	font-weight: bold;
	color: var(--q-primary-text);
	text-transform: uppercase;
	text-align: center;
	padding: 11px 20px;
	z-index: 2;
	cursor: pointer;
	transition: color 250ms ease-in-out;
	user-select: none;

	&.active {
		color: #fff;
	}
}
</style>
