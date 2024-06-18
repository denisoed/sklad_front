// Creates an event handler that can be used in Vue code
export default function (el, action, detail) {
  el.dispatchEvent(new CustomEvent(`v-drag-${action}`, { detail }));
}
