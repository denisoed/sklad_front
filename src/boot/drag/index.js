import { boot } from 'quasar/wrappers'
import dragSetup from './events/dragSetup';

import vueDragEvent from './utils/vueDragEvent';

function initStyles() {
  // Initialize 'data' object
  window.data = {};

  // Store default event classes
  window.data.class = {
    initial: 'v-click-out',
    usesHandle: 'drag-uses-handle',
    handle: 'drag-handle',
    down: 'drag-down',
    move: 'drag-move',
    dragHandleDisable: 'drag-handle-disable'
  };

  // Create stylesheet with basic styling (position, z-index and cursors)
  const styleElement = document.createElement('style');
  styleElement.innerHTML = `.${window.data.class.initial}{}.${window.data.class.initial}:not(.${window.data.class.usesHandle}),.${window.data.class.handle}{cursor:move;cursor:grab;cursor:-webkit-grab;}.${window.data.class.handle}.${window.data.class.down},.${window.data.class.initial}:not(.${window.data.class.usesHandle}).${window.data.class.down}{z-index:999;cursor:grabbing;cursor:-webkit-grabbing;}`;
  document.body.appendChild(styleElement);
}

const mountProperties = (el, binding) => {
  const value = binding.value || {};

  const position = value.position ?? null;
  const size = value.size ?? null;

  if (position instanceof Object) {
    el.style.top = typeof position.y === 'number' ? `${position.y}px` : position.y;
    el.style.left = typeof position.x === 'number' ? `${position.x}px` : position.x;
  }

  if (size instanceof Object) {
    el.style.width = typeof size.w === 'number' ? `${size.w}px` : size.w;
    el.style.height = typeof size.h === 'number' ? `${size.h}px` : size.h;
  }
}

// Add draggable configuration to element for the first time
const mountedHook = (el, binding) => {
  dragSetup(el, binding);
  mountProperties(el, binding);
};

// Update the drag configuration
const updatedHook = (el, binding) => {
  // Remove events from updated element
  el.onmousedown = null;
  el.ontouchstart = null;

  const handle = typeof binding.oldValue === 'object'
    ? binding.oldValue.handle
    : binding.oldValue;

  const oldHandleArray = document.querySelectorAll(handle);

  oldHandleArray.forEach((oldHandle) => {
  // Remove events from the old handle
    oldHandle.onmousedown = null;
    oldHandle.ontouchstart = null;

    // Remove CSS classes related to the old handle
    oldHandle.classList.remove(window.data.class.handle);
    el.classList.remove(window.data.class.usesHandle);
  });

  // Vue event if anything is updated
  if (binding.oldValue) {
    Object.keys(binding.oldValue).forEach((key) => {
      vueDragEvent(el, `update-${key}`);
    });
  }

  // Add draggable configuration to element
  dragSetup(el, binding);
};

export default boot(async ({ app }) => {
  initStyles();
  app.directive('drag', {
    mounted(el, binding) {
      mountedHook(el, binding);
    },

    updated(el, binding) {
      updatedHook(el, binding);
    },
  })
})
