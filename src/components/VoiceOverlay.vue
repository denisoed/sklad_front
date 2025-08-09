<template>
  <transition name="fade">
    <teleport to="body">
      <div v-if="modelValue" class="voice-overlay flex flex-center flex-col">
        <q-btn
          color="negative"
          push
          round
          icon="mdi-close"
          @click="handleCancel"
          class="absolute-top-right q-mt-md q-mr-md"
        />

        <div class="voice-indicator q-mb-md">
          <q-icon 
            :name="isRecording ? 'mic' : 'mic_off'" 
            size="48px" 
            :color="isRecording ? 'primary' : 'grey'" 
          />
        </div>
        <div class="voice-placeholder q-mb-md">
          <span v-if="!isApiAvailable" class="text-red q-mb-md">
            Распознавание речи недоступно в вашем браузере
          </span>
          <span v-else-if="!hasStartedRecording" class="text-bold">
            Зажмите кнопку ниже, чтобы начать запись
          </span>
          <span v-else-if="!recognizedText && !isRecording && !isUserPressingButton" class="text-bold text-red">
            Не удалось распознать речь. Попробуйте сказать еще раз...
          </span>
          <span v-else-if="!recognizedText" class="text-bold">Говорите...</span>
          <span v-else>{{ recognizedText }}</span>
        </div>
        
        <!-- Кнопка записи -->
        <div class="record-button-container q-mb-md">
          <q-btn
            v-if="isApiAvailable"
            :color="isUserPressingButton ? 'negative' : 'primary'"
            :icon="isUserPressingButton ? 'stop' : 'mic'"
            size="lg"
            round
            class="record-button"
            @pointerdown="handlePointerDown"
            @pointerup="handlePointerUp"
            @pointercancel="handlePointerCancel"
            @pointerleave="handlePointerLeave"
            @contextmenu.prevent
          />
        </div>

        <q-btn
          v-if="hasStartedRecording && !isUserPressingButton && !isRecording"
          color="primary"
          push
          label="Заново"
          @click="handleRetry"
        />
        
        <canvas ref="canvasRef" class="voice-canvas" width="480" height="240"></canvas>
      </div>
    </teleport>
  </transition>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import useSpeechRecognition from '../modules/useSpeechRecognition'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['cancel', 'update:modelValue', 'result', 'colorResult'])

const canvasRef = ref(null)
const recognizedText = ref('')
const isRetrying = ref(false)
const hasStartedRecording = ref(false)
const isIOS = ref(/iPad|iPhone|iPod/.test(navigator.userAgent))
const isUserPressingButton = ref(false)

// Sequence guard to avoid async race between close and open
let lifecycleSeq = 0

// Аудио контекст и связанные переменные
let audioContext = null
let analyser = null
let dataArray = null
let source = null
let animationId = null
let stream = null
let isAudioInitialized = false

// Создаем экземпляр распознавания речи
const speechRecognition = useSpeechRecognition()
const {
  isRecording,
  isApiAvailable,
  startRecord,
  stopRecord,
  onFinish,
  transcript,
  cleanup,
  setShouldContinueCallback,
  resetAccumulatedText,
  destroy,
  restore
} = speechRecognition

// Устанавливаем callback для проверки, нужно ли продолжать запись
setShouldContinueCallback(() => isUserPressingButton.value)

// Create a reusable finish handler to rebind after restore()
const finishHandler = (finalText) => {
  if (isRetrying.value) {
    return
  }
  recognizedText.value = finalText
}

// Register finish handler initially
onFinish(finishHandler)

async function handleCancel() {
  recognizedText.value = ''
  hasStartedRecording.value = false
  isUserPressingButton.value = false
  // Ensure recognition won't auto-restart during teardown
  setShouldContinueCallback(() => false)
  if (isRecording.value) {
    stopRecord()
  }
  await stopAudio()
  emit('cancel')
  emit('update:modelValue', false)
}

function handleRetry() {
  isRetrying.value = true
  recognizedText.value = ''
  hasStartedRecording.value = false
  isUserPressingButton.value = false
  if (isRecording.value) {
    stopRecord()
  }
  resetAccumulatedText()
  
  setTimeout(() => {
    isRetrying.value = false
  }, 300)
}

async function handlePointerDown(event) {
  if (!isApiAvailable || isRetrying.value) return
  if (event) event.preventDefault()

  hasStartedRecording.value = true
  isUserPressingButton.value = true

  // Очищаем текст при начале новой записи
  if (!isRecording.value) {
    recognizedText.value = ''
    resetAccumulatedText()
  }

  // Готовим аудио-визуализацию по требованию
  if (!isAudioInitialized) {
    await startAudio()
  } else if (isIOS.value && audioContext && audioContext.state === 'suspended') {
    try { await audioContext.resume() } catch (error) { console.error('AudioContext resume iOS error:', error) }
  }

  if (!isRecording.value) {
    startRecord()
  }
}

function submitIfNeededAndClose() {
  const resultToSend = (transcript.value || recognizedText.value || '').trim()
  if (resultToSend) {
    emit('result', resultToSend)
  }
  emit('update:modelValue', false)
  recognizedText.value = ''
}

async function handlePointerUp(event) {
  if (!isApiAvailable || isRetrying.value) return
  if (event) event.preventDefault()

  isUserPressingButton.value = false

  if (isRecording.value) {
    stopRecord()
  }

  // Останавливаем аудио сразу после отпускания
  await stopAudio()

  // Небольшая задержка, чтобы дать доехать финальным результатам
  setTimeout(() => {
    submitIfNeededAndClose()
  }, 150)
}

async function handlePointerCancel(event) {
  if (event) event.preventDefault()
  isUserPressingButton.value = false
  if (isRecording.value) {
    stopRecord()
  }
  await stopAudio()
  setTimeout(() => {
    submitIfNeededAndClose()
  }, 150)
}

async function handlePointerLeave(event) {
  if (event) event.preventDefault()
  // Если палец/курсор ушел за пределы, считаем как отпускание
  if (isUserPressingButton.value) {
    await handlePointerUp(event)
  }
}

function drawBars() {
  const canvas = canvasRef.value
  if (!canvas || !analyser || !audioContext || audioContext.state === 'closed') {
    return
  }
  
  try {
    const ctx = canvas.getContext('2d')
    ctx.setTransform(2, 0, 0, 2, 0, 0)
    const WIDTH = canvas.width / 2
    const HEIGHT = canvas.height / 2
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    
    analyser.getByteFrequencyData(dataArray)
    ctx.save()
    
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--q-primary') || '#1976d2'
    const barCount = 32
    const barWidth = WIDTH / barCount
    
    for (let i = 0; i < barCount; i++) {
      const dataIdx = Math.floor(i * dataArray.length / barCount)
      const value = dataArray[dataIdx]
      const barHeight = (value / 255) * (HEIGHT / 2)
      const x = i * barWidth
      
      ctx.beginPath()
      ctx.roundRect(x + 2, HEIGHT / 2 - barHeight, barWidth - 4, barHeight, 4)
      ctx.fillStyle = accent
      ctx.globalAlpha = 0.85
      ctx.shadowColor = accent
      ctx.shadowBlur = 8
      ctx.fill()
      
      ctx.beginPath()
      ctx.roundRect(x + 2, HEIGHT / 2, barWidth - 4, barHeight, 4)
      ctx.fillStyle = accent
      ctx.globalAlpha = 0.7
      ctx.shadowColor = accent
      ctx.shadowBlur = 8
      ctx.fill()
    }
    
    ctx.restore()
    animationId = requestAnimationFrame(drawBars)
  } catch (error) {
    console.error('Ошибка при отрисовке визуализации:', error)
  }
}

async function startAudio() {
  // Полная очистка перед новой инициализацией
  if (isAudioInitialized) {
    await stopAudio()
  }

  try {
    // Запрашиваем доступ к микрофону с iOS-оптимизированными настройками
    const audioConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        ...(isIOS.value && {
          sampleRate: 44100,
          channelCount: 1
        })
      }
    }
    
    stream = await navigator.mediaDevices.getUserMedia(audioConstraints)
    
    // Создаем новый AudioContext для каждой сессии
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    audioContext = new AudioContextClass({
      sampleRate: isIOS.value ? 44100 : undefined
    })
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
    
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 64
    analyser.smoothingTimeConstant = 0.8
    dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)
    
    isAudioInitialized = true
    
    await nextTick()
    drawBars()
    
  } catch (e) {
    console.error('Ошибка доступа к микрофону:', e)
    await stopAudio()
    emit('update:modelValue', false)
  }
}

async function stopAudio() {
  try {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    
    if (source) {
      try { source.disconnect() } catch (error) { console.error('Ошибка отключения source:', error) }
      source = null
    }
    
    if (audioContext && audioContext.state !== 'closed') {
      try { await audioContext.close() } catch (error) { console.error('Ошибка закрытия AudioContext:', error) }
    }
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
        track.enabled = false
      })
      stream = null
    }
    
    audioContext = null
    analyser = null
    dataArray = null
    isAudioInitialized = false
    
  } catch (error) {
    console.error('Ошибка при остановке аудио:', error)
  }
}

// Следим за изменениями transcript для обновления отображения
watch(transcript, (newText) => {
  if (newText) {
    recognizedText.value = newText
  }
})

watch(() => props.modelValue, async (val) => {
  const seq = ++lifecycleSeq
  if (val) {
    recognizedText.value = ''
    hasStartedRecording.value = false
    isRetrying.value = false
    isUserPressingButton.value = false
    
    // Restore after full teardown (relevant for iOS fresh instance)
    restore()
    // Rebind finish handler after restore
    onFinish(finishHandler)
    resetAccumulatedText()
    
    // Bind should-continue callback immediately to avoid gaps on iOS
    setShouldContinueCallback(() => isUserPressingButton.value)
    
    if (isIOS.value) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // If state changed while awaiting, abort this open flow
    if (seq !== lifecycleSeq || !props.modelValue) {
      return
    }
    
    await startAudio()
  } else {
    // Immediately disable continuation to prevent unintended restart
    isUserPressingButton.value = false
    setShouldContinueCallback(() => false)

    if (isRecording.value) {
      stopRecord()
    }
    await stopAudio()
    
    // If state changed while awaiting, abort this close flow
    if (seq !== lifecycleSeq || props.modelValue) {
      return
    }
    
    // Ensure full cleanup on all platforms
    destroy()
  }
})

onBeforeUnmount(async () => {
  await stopAudio()
  if (isRecording.value) {
    stopRecord()
  }
})
</script>

<style scoped lang="scss">
.voice-overlay {
  position: fixed;
  z-index: 99999;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}
.voice-indicator {
  position: relative;
  width: 120px;
  height: 80px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.record-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}
.record-button {
  width: 80px;
  height: 80px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.95);
  }
}
.voice-canvas {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 240px;
  height: 120px;
  z-index: 1;
}
.voice-placeholder {
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 24px;
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 16px;
  width: 90%;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 