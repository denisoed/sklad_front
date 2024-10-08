<template>
  <div ref='telegram'></div>
</template>

<script setup>
import { defineEmits, defineProps, onMounted, ref } from "vue"

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator (value) { return ['callback', 'redirect'].includes(value) }
  },
  telegramLogin: {
    type: String,
    required: true,
    validator (value) { return value.endsWith('bot') || value.endsWith('Bot') }
  },
  redirectUrl: {
    type: String,
    default: ''
  },
  requestAccess: {
    type: String,
    default: 'read',
    validator (value) { return ['read', 'write'].includes(value) }
  },
  size: {
    type: String,
    default: 'large',
    validator (value) { return ['small', 'medium', 'large'].includes(value) }
  },
  userpic: {
    type: Boolean,
    default: false
  },
  radius: {
    type: String
  }
})

const emit = defineEmits(['callback', 'loaded'])

const telegram = ref(null)

function onTelegramAuth(user) {
  emit('callback', user)
}

function init() {
  const script = document.createElement("script")
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  
  script.setAttribute('data-size', props.size)
  script.setAttribute('data-userpic', props.userpic)
  script.setAttribute('data-telegram-login', props.telegramLogin)
  script.setAttribute('data-request-access', props.requestAccess)
  
  script.onload = () => {
    emit('loaded')
  }
  
  if (props.radius) script.setAttribute('data-radius', props.radius)
  
  if (props.mode === 'callback') {
    window.onTelegramAuth = onTelegramAuth
    script.setAttribute('data-onauth', 'window.onTelegramAuth(user)')
  } else {
    script.setAttribute('data-auth-url', props.redirectUrl)
  }
  telegram.value.appendChild(script)
}

onMounted(() => {
  init();
});
</script>