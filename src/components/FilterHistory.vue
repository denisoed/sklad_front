<template>
  <q-dialog
    :model-value="opened"
    position="bottom"
    @update:model-value="close"
  >
    <q-card style="width: 350px">
      <q-card-section class="flex no-wrap column row items-center no-wrap q-pb-xl">
        <p class="full-width text-left text-bold q-mb-none text-subtitle1">
          {{ $t('history.filterByHistory') }}
        </p>
        <div class="flex justify-center full-width q-mt-sm">
          <div class="flex column full-width q-gap-md">
            <q-select
              outlined
              v-model="formData.actions"
              multiple
              clearable
              use-chips
              :options="actions"
              :label="$t('filter.searchByEvent')"
              behavior="menu"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-attachment" />
              </template>
              <template v-slot:option="scope">
                <q-item v-if="!scope.opt.group"
                  v-bind="scope.itemProps"
                  v-on="scope.itemEvents"
                >
                  <q-item-section>
                    <q-item-label class="flex">
                      <div
                        class="q-pa-sm q-mr-sm"
                        :style="`border-radius:100%;opacity:0.5;background: ${scope.opt.color};`"
                      />
                      <span>{{ scope.opt.label }}</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-select
              outlined
              v-model="formData.people"
              multiple
              clearable
              use-chips
              :options="skladUsers"
              :label="$t('filter.searchByPeople')"
              behavior="menu"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
              <template v-slot:option="scope">
                <q-item v-if="!scope.opt.group"
                  v-bind="scope.itemProps"
                  v-on="scope.itemEvents"
                >
                  <q-item-section>
                    <q-item-label>
                      <span>{{ scope.opt.label }}</span>
                    </q-item-label>
                    <q-item-label caption>
                      <span>{{ scope.opt.email }}</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-input
              v-model="formData.description"
              outlined
              clearable
              :label="$t('filter.searchByDescription')"
              class="full-width"
              enterkeyhint="done"
            />
          </div>
          <q-separator class="full-width q-my-md" />
          <div class="flex justify-between no-wrap q-gap-md full-width">
              <q-btn
              style="height:40px;"
              color="deep-orange"
              icon="mdi-refresh"
              push
              @click="clear"
            />
              <q-btn
              class="button-size q-mr-auto"
              color="grey"
              icon="mdi-close"
              push
              @click="close"
            />
              <q-btn
              class="button-size"
              color="primary"
              icon="search"
              push
              @click="search"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  HISTORY_CREATE,
  HISTORY_UPDATE,
  HISTORY_DELETE,
  HISTORY_SOLD,
  HISTORY_ACTIONS_COLORS
} from 'src/config'

defineOptions({
  name: 'FilterHistory'
})

const props = defineProps({
  opened: {
    type: Boolean,
    default: false
  },
  users: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'save', 'on-search'])

const { t: $t } = useI18n()

const { users } = toRefs(props)
const formData = reactive({
  description: null,
  actions: null,
  people: null
})

const actions = computed(() => [
  {
    label: $t(`history.actions.${HISTORY_CREATE}`),
    value: HISTORY_CREATE,
    color: HISTORY_ACTIONS_COLORS[HISTORY_CREATE]
  },
  {
    label: $t(`history.actions.${HISTORY_UPDATE}`),
    value: HISTORY_UPDATE,
    color: HISTORY_ACTIONS_COLORS[HISTORY_UPDATE]
  },
  {
    label: $t(`history.actions.${HISTORY_DELETE}`),
    value: HISTORY_DELETE,
    color: HISTORY_ACTIONS_COLORS[HISTORY_DELETE]
  },
  {
    label: $t(`history.actions.${HISTORY_SOLD}`),
    value: HISTORY_SOLD,
    color: HISTORY_ACTIONS_COLORS[HISTORY_SOLD]
  }
])

const skladUsers = computed(() =>
  users.value.map(u => ({ label: u.fullname, email: u.email, value: u.id }))
)

function close() {
  emit('close')
}

function search() {
  close()
  emit('on-search', formData)
}

function clear() {
  formData.description = null
  formData.actions = null
  formData.people = null
  search()
}
</script>
