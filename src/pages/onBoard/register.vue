<template>
  <q-page>
    <div class="container">
      <div v-if="step === 0">
        <h1 class="title text-h5 text-bold">Добро пожаловать склад!</h1>
        <p class="q-mt-md">Чтобы быстрее разобраться со Складом, предлагаем Вам пройти мини инструкцию, где мы шаг за шагом настроим для Вас рабочее окружение.</p>
        <p class="q-mt-md">Не переживайте, инструкция состоит всего лишь из <b>4х</b> шагов.</p>
        <q-img src="~/assets/onboard-reg-bg.webp" alt="Welcome to team" class="full-width" />
      </div>
      <div v-if="step === 3">
        <h2 class="flex items-center title text-h4 text-bold">01 - <span class="text-h5 q-ml-sm">Создание склада</span></h2>
        <h3 class="text-subtitle1 text-bold q-mb-sm">Что такое склад?</h3>
        <p class="q-mt-sm">Складом в нашей системе мы называем группу товаров разделённых по категориям.</p>
        <p class="q-mt-sm">Склад позволяет вести учёт товаров, мгновенно получать Отчеты по продажам, видеть товары, которые скоро закончатся и многое другое. Всем этим можно управлять с любого устройства.</p>
        <h3 class="text-subtitle1 text-bold q-mb-sm">Приступим к созданию</h3>
        <p class="q-mt-sm">Для примера, давайте создадим склад обуви.</p>
        <p class="q-mt-sm">Для этого нажмите на заленую кнопку "Создать скалад". </p>
      </div>
      <div v-if="step === 2">
        <h2 class="flex items-center title text-h4 text-bold">02 - <span class="text-h5 q-ml-sm">Настройка размеров</span></h2>
        <div :style="[sizesCreated && 'opacity: 0.5']">
          <p class="q-mt-md">
            После успешного создания склада, перейдем к его настройкам.
          </p>
          <p class="q-mt-sm text-bold">
            Единственное, что нам сейчас нужно найтроить - это размеры. Далее они будут использоваться в товарах. Без них работа невозможна.
          </p>
          <p class="q-mt-sm">
            И поскольку для примера мы настраиваем склад обуви, то и рамеры добавим соответствущие. Например, 36, 37 и 38.
          </p>
          <p class="q-mt-sm">
            Приступим. В поле ниже, через запятую, введите выбранные нами размеры - 36, 37, 38 и нажмите на кнопку с иконкой плюсика.
          </p>
          <div class="full-width flex no-wrap q-my-xl">
            <q-input
              v-model="sizes"
              outlined
              dense
              class="q-pr-md full-width"
              placeholder="Например: 36, 37, 38"
              :disable="sizesCreated"
            />
            <q-btn
              color="primary"
              @click="addStartSizes"
              :disable="!sizes && !sizesCreated"
              v-vibrate
            >
              <q-icon name="mdi-plus" />
            </q-btn>
          </div>
        </div>
        <p v-if="sizesCreated" class="q-mt-sm">
          После успешного добавления размеров, склад готов к работе. Теперь созданные нами размеры будут использоваться во всех товарах этого склада. Если что, их потом можно отредактировать в настройках. На этом всё, можем идти дальше.
        </p>
      </div>
      <div v-if="step === 3">
        <h2 class="flex items-center title text-h4 text-bold">03 - <span class="text-h5 q-ml-sm">Добавление категории</span></h2>
        <h3 class="text-subtitle1 text-bold q-mb-sm">Для чего нужны категории?</h3>
        <p class="q-mt-sm">При большом кол-ве товаров на складе, поиск нужной модели становится затрудруднительным. Поскольку, каждый раз приходится проматывать нужные и не нужные товары.</p>
        <p class="q-mt-sm">Категории же позволяют разбить товары по категориям и обеспечить более удобный визуальный поиск.</p>
        <p class="q-mt-sm">В дополнении к этому, при создании категории, можно задать цвет, который так же поможет облегчить поиск.</p>
        <h3 class="text-subtitle1 text-bold q-mb-sm">Добавим категорию</h3>
        <p class="q-mt-sm">
          В качестве названия категории, можно указать, например <b>Adidas</b>, где соответственно будет храниться вся обувь бренда <b>Adidas</b>.
        </p>
        <p class="q-mt-sm">Чтобы продолжить, нажмите на залёную кнопку "Добавить категорию".</p>
      </div>
      <div v-if="step === 1">
        <h2 class="flex items-center title text-h4 text-bold">04 - <span class="text-h5 q-ml-sm">Создание товара</span></h2>
        <h3 class="text-subtitle1 text-bold q-mb-sm">Что такое товар?</h3>
        <p class="q-mt-sm">Поскольку мы создает обувной склад, то товар в нашем случае - это ленейка обуви, состоящая из нескольких размеров.</p>
        <h3 class="text-subtitle1 text-bold q-mb-sm">Приступим</h3>
      </div>
      <div class="flex justify-between full-width q-mt-auto">
        <q-btn v-vibrate v-if="step === 0" @click="prevStep" color="grey" push style="width: 120px;">Пропустить</q-btn>
        <q-btn v-vibrate v-if="step === 0" @click="nextStep" color="primary" push style="width: 120px;">Начать</q-btn>
        <q-btn v-vibrate v-if="step === 3" class="q-ml-auto" color="primary" push @click="openedNewSkladModal = true">Создать склад</q-btn>
        <q-btn v-vibrate v-if="step === 2 && sizesCreated" @click="nextStep" color="primary" push class="q-ml-auto">Продолжить</q-btn>
        <q-btn v-vibrate v-if="step === 1" color="primary" push class="q-ml-auto">Добавить товар</q-btn>
      </div>
    </div>

    <CrudModal
      :opened="openedNewSkladModal"
      :create-gql="CREATE_SKLAD"
      :extend-create-params="{ users: profile?.id }"
      @close="onCloseModal"
      @on-create-new="onCreateNew"
      title="склад"
    />
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import useProfile from 'src/modules/useProfile'
import CrudModal from 'src/components/CrudModal.vue'
import { ALL_PERMISSIONS } from 'src/permissions'
import {
  CREATE_SKLAD,
} from 'src/graphql/sklads'

export default defineComponent({
  name: 'OnBoardPage',
  components: {
    CrudModal,
  },
  setup() {
    const { profile, updateUser, fetchProfile } = useProfile()
    const step = ref(0)
    const sizesCreated = ref(false)
    const sizes = ref(null)
    const openedNewSkladModal = ref(false)

    function nextStep() {
      step.value += 1
    }

    function prevStep() {
      if (step.value > 0) {
        step.value -= 1
      }
    }

    function onCloseModal() {
      openedNewSkladModal.value = false
    }

    async function onCreateNew(payload) {
      await fetchProfile();
      const skladId = payload?.createSklad?.sklad?.id;
      const currentPermissions = profile.value?.permissions?.map(p => ({ sklad: p?.sklad?.id, list: p?.list }));
      await updateUser(profile.value.id, {
        permissions: [
          ...(currentPermissions?.length && currentPermissions || []),
          {
            sklad: skladId,
            list: ALL_PERMISSIONS
          }
        ]
      });
      fetchProfile();
      step.value = 2
    }

    async function addStartSizes() {
      // const list = sizes.value.split(',').map(l => l.trim())
      // await updateSklad({
      //   id: sklad.value?.id,
      //   data: {
      //     sizes: list
      //   }
      // })
      // if (!updateSkladError.value) {
      //   showSuccess('Новый размер добавлен!')
      // } else {
      //   showError('Произошла ошибка! Попробуйте позже :(')
      // }
      sizes.value = null
      sizesCreated.value = true
    }

    return {
      step,
      nextStep,
      prevStep,
      profile,
      openedNewSkladModal,
      CREATE_SKLAD,
      onCloseModal,
      onCreateNew,
      sizes,
      addStartSizes,
      sizesCreated
    }
  }
})
</script>

<style lang="scss" scoped>
.title {
  line-height: normal;
  margin: 0;
}
</style>
