import useEventBus from 'src/modules/useEventBus';

const useDialog = () => {
  const { emitBus, BUS_EVENTS } = useEventBus();

  function openDialog(id, data) {
    emitBus(BUS_EVENTS.OPEN_DIALOG, { id, ...data });
  }

  function closeDialog(id) {
    emitBus(BUS_EVENTS.CLOSE_DIALOG, id);
  }

  return {
    openDialog,
    closeDialog,
  };
};

export default useDialog;