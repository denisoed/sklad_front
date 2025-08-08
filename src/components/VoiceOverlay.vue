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
          <span v-else-if="!recognizedText && !isRecording" class="text-bold text-red">
            Не удалось распознать речь. Попробуйте сказать еще раз...
          </span>
          <span v-else-if="!recognizedText" class="text-bold">Говорите...</span>
          <span v-else>{{ recognizedText }}</span>
        </div>
        
        <!-- Кнопка записи -->
        <div v-if="!hasStartedRecording || isRecording" class="record-button-container q-mb-md">
          <q-btn
            v-if="isApiAvailable"
            :color="isRecording ? 'negative' : 'primary'"
            :icon="isRecording ? 'stop' : 'mic'"
            size="lg"
            round
            class="record-button"
            @mousedown="handleRecordStart"
            @mouseup="handleRecordStop"
            @mouseleave="handleRecordStop"
            @touchstart="handleRecordStart"
            @touchend="handleRecordStop"
            @touchcancel="handleRecordStop"
            @contextmenu.prevent
          />
        </div>

        <q-btn
          v-if="hasStartedRecording && !isRecording"
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
const { isRecording, isApiAvailable, startRecord, stopRecord, onFinish, transcript, cleanup } = speechRecognition

onFinish((finalText) => {
  if (isRetrying.value) {
    return
  }
  recognizedText.value = finalText

  // Emit both the full text and any found colors
  emit('result', finalText)
  
  emit('update:modelValue', false)
})

function handleCancel() {
  recognizedText.value = ''
  hasStartedRecording.value = false
  if (isRecording.value) {
    stopRecord()
  }
  emit('cancel')
}

function handleRetry() {
  isRetrying.value = true
  recognizedText.value = ''
  hasStartedRecording.value = false
  if (isRecording.value) {
    stopRecord()
  }
  
  // Даем время на остановку перед новой попыткой
  setTimeout(() => {
    isRetrying.value = false
  }, 300)
}

function handleRecordStart(event) {
  if (!isApiAvailable || isRetrying.value) return
  
  // Prevent default behavior to avoid context menu
  if (event) {
    event.preventDefault()
  }
  
  hasStartedRecording.value = true
  if (!isRecording.value) {
    startRecord()
  }
}

function handleRecordStop(event) {
  if (!isApiAvailable || isRetrying.value) return
  
  // Prevent default behavior
  if (event) {
    event.preventDefault()
  }
  
  if (isRecording.value) {
    stopRecord()
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
  // Предотвращаем множественную инициализацию
  if (isAudioInitialized) {
    return
  }

  try {
    // Запрашиваем доступ к микрофону
    stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    })
    
    // Создаем новый AudioContext
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Проверяем состояние контекста
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
    
    // Ждем следующий тик для начала анимации
    await nextTick()
    drawBars()
    
  } catch (e) {
    console.error('Ошибка доступа к микрофону:', e)
    stopAudio()
    emit('update:modelValue', false)
  }
}

function stopAudio() {
  try {
    // Останавливаем анимацию
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    
    // Закрываем аудио контекст
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(e => console.error('Ошибка закрытия AudioContext:', e))
    }
    
    // Останавливаем поток медиа
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
        track.enabled = false
      })
    }
    
    // Очищаем ссылки
    audioContext = null
    analyser = null
    dataArray = null
    source = null
    stream = null
    isAudioInitialized = false
    
  } catch (error) {
    console.error('Ошибка при остановке аудио:', error)
  }
}

watch(transcript, (newText) => {
  if (newText) {
    recognizedText.value = newText
  }
})

watch(() => props.modelValue, async (val) => {
  if (val) {
    recognizedText.value = ''
    hasStartedRecording.value = false
    isRetrying.value = false
    await startAudio()
  } else {
    // Останавливаем запись при закрытии оверлея
    if (isRecording.value) {
      stopRecord()
    }
    stopAudio()
    // Даем время на корректное закрытие
    setTimeout(() => {
      cleanup()
    }, 100)
  }
})

onBeforeUnmount(() => {
  stopAudio()
  if (isRecording.value) {
    stopRecord()
  }
  cleanup()
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
  background-color: rgba(0, 0, 0, 0.3);
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