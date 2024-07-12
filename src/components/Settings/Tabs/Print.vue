<template>
  <div class="full-width q-mt-md">
    <h6 class="q-mt-none q-mb-md text-grey-5 text-subtitle1">Подключение к принтеру</h6>
    <h6 v-if="!listTemplates.length" class="full-width flex column items-center text-center text-grey-5 q-ma-none">
      <span v-if="loadingTemplates">
        <q-icon size="sm" name="mdi-loading" class="mdi-spin q-mr-sm " />
        Загрузка...
      </span>
      <div v-else class="flex column items-center">
        <span>
          <q-icon size="sm" name="mdi-printer-alert" class="q-mr-sm text-grey-5" />
          Список пуст
        </span>
        <p class="q-mt-md text-subtitle2 " style="max-width:350px;">
          Для создания шаблона, воспользуйтесь кнопкой {{ $t('Print_15') }}, под этим описанием.
        </p>
      </div>
    </h6>
    <div v-else class="templates_cards">
      <router-link
        v-for="(template, i) of listTemplates"
        :key="i"
        :to="`/sklad/${params?.skladId}/PriceLabelEditor/${template.id}`"
        class="templates_card"
        v-touch-hold.mouse="onHold"
        @mousedown="onMouseDown(template)"
        @touchstart="onMouseDown(template)"
        v-ripple
        v-vibrate
      >
        <div
          class="templates_card-color"
          :style="{
            'background-color': template?.color,
            'color': template?.color === 'white' ? '#000' : '#fff'
          }"
        >
          {{ template?.name?.[0] }}
        </div>
        <div class="templates_card-name">
          {{ template?.name }}
        </div>
      </router-link>
    </div>
    <div class="flex column items-center q-mt-lg">
      <q-btn color="primary" push outline @click="openedNewTemplateModal = true" v-vibrate>
        Создать шаблон
      </q-btn>
    </div>

    <NewTemplate
      :opened="openedNewTemplateModal"
      :is-loading="isLoading"
      :selected="selectedTemplate"
      @on-create="create"
      @on-delete="onDelete"
      @close="close"
    />
  </div>
</template>

<script>
import { useQuasar } from 'quasar'
import {
  defineComponent,
  ref,
  computed
} from 'vue'
import {
  CREATE_PRINT_TEMPLATE,
  DELETE_PRINT_TEMPLATE,
  PRINT_TEMPLATES
} from 'src/graphql/print'
import useHelpers from 'src/modules/useHelpers'
import { useRoute } from 'vue-router'
import { useMutation, useQuery } from '@vue/apollo-composable'
import NewTemplate from 'src/components/Settings/NewTemplate.vue'

export default defineComponent({
  name: 'SettingsPrint',
  components: {
    NewTemplate,
  },
  setup(props, { emit }) {
    const $q = useQuasar()
    const { params } = useRoute()
    const {
      mutate: createTemplate,
      loading: loadingCreateTemplate,
      error: errorCreateTemplate,
    } = useMutation(CREATE_PRINT_TEMPLATE)
    const {
      mutate: deleteTemplate,
      loading: loadingDeleteTemplate,
      error: errorDeleteTemplate,
    } = useMutation(DELETE_PRINT_TEMPLATE)
    const {
      result: templates,
      loading: loadingTemplates,
      refetch: refetchTemplates
    } = useQuery(PRINT_TEMPLATES)
    const { showSuccess, showError } = useHelpers()

    const openedNewTemplateModal = ref(false)
    const selectedTemplate = ref(null)

    function close() {
      openedNewTemplateModal.value = false
      selectedTemplate.value = null
    }

    function onHold() {
      openedNewTemplateModal.value = true
    }

    function onMouseDown(template) {
      selectedTemplate.value = template
    }

    async function create(data) {
      await createTemplate({ data: { ...data, sklads: params?.skladId }})
      if (!errorCreateTemplate.value) {
        refetchTemplates()
        openedNewTemplateModal.value = false
        showSuccess($t('Print_125'))
        close()
      } else {
        showError($t('Print_128'))
      }
      close()
    }

    async function onDelete(id) {
      $q.dialog({
        title: $t('Print_135'),
        message: $t('Print_136'),
        cancel: true,
        persistent: true,
        ok: {
          color: 'deep-orange',
          label: $t('Print_141'),
          push: true
        },
        cancel: {
          color: 'white',
          textColor: 'black',
          label: $t('Print_147'),
          push: true
        }
      }).onOk(async () => {
        await deleteTemplate({ id })
        if (!errorDeleteTemplate.value) {
          refetchTemplates()
          openedNewTemplateModal.value = false
          showSuccess($t('Print_155'))
          close()
        } else {
          showError($t('Print_158'))
        }
        close()
      })
    }

    const isLoading = computed(() =>
      loadingCreateTemplate.value ||
      loadingDeleteTemplate.value
    )

    const listTemplates = computed(() => templates.value?.printTemplates || [])

    return {
      openedNewTemplateModal,
      close,
      create,
      isLoading,
      onHold,
      onMouseDown,
      onDelete,
      listTemplates,
      loadingTemplates,
      selectedTemplate,
      params
    }
  }
})
</script>

<style lang="scss" scoped>
.templates {
  &_cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;

    @media screen and (max-width: 420px) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &_card {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    background-color: #fff;
    cursor: pointer;

    &-name {
      width: 100%;
      font-size: 16px;
      padding: 2px 4px;
      box-sizing: border-box;
      text-align: center;
      background-color: rgb(0 255 255 / 8%);
    }

    &-color {
      width: 60px;
      height: 60px;
      background-color: red;
      border-radius: 100%;
      margin: 12px 0;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 24px;
      color: #fff;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 3px 9px 0px;
    }
  }
}
</style>
