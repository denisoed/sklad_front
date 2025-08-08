<template>
  <DialogWrapper
    :id="MANAGE_SKLAD_DIALOG"
    position="bottom"
  >
    <CrudModal
      :create-gql="CREATE_SKLAD"
      :update-gql="UPDATE_SKLAD"
      :extend-create-params="{ users: profile?.id, owner: profile?.id }"
      @finished="refetchSklads"
      @on-create-new="onCreateNew"
      @close="onCloseModal"
      title="склад"
    />
  </DialogWrapper>
</template>

<script setup>
import {
  CREATE_SKLAD,
  UPDATE_SKLAD
} from 'src/graphql/sklads'
import CrudModal from 'src/components/Dialogs/CrudModal.vue'
import useProfile from 'src/modules/useProfile'
import useSklads from 'src/modules/useSklads'
import DialogWrapper from 'src/components/Dialogs/DialogWrapper.vue'
import { MANAGE_SKLAD_DIALOG } from 'src/config/dialogs'
import useEventBus from 'src/modules/useEventBus/index'

const { profile } = useProfile()
const { fetchSklads, onCreateNew } = useSklads()
const { emitBus, BUS_EVENTS } = useEventBus()

function refetchSklads() {
  fetchSklads(profile.value.id)
}

function onCloseModal() {
  emitBus(BUS_EVENTS.CLOSE_DIALOG, MANAGE_SKLAD_DIALOG)
}
</script>