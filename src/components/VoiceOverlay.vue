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
        <div v-if="!hasStartedRecording || isUserPressingButton" class="record-button-container q-mb-md">
          <q-btn
            v-if="isApiAvailable"
            :color="isUserPressingButton ? 'negative' : 'primary'"
            :icon="isUserPressingButton ? 'stop' : 'mic'"
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
          v-if="hasStartedRecording && !isUserPressingButton && !pendingResult"
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
const pendingResult = ref('')
const isUserPressingButton = ref(false) // Отслеживаем физическое нажатие кнопки пользователем

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
const { isRecording, isApiAvailable, startRecord, stopRecord, onFinish, transcript, cleanup, setShouldContinueCallback, resetAccumulatedText } = speechRecognition

// Устанавливаем callback для проверки, нужно ли продолжать запись
setShouldContinueCallback(() => isUserPressingButton.value)

onFinish((finalText) => {
  if (isRetrying.value) {
    return
  }
  
  // Сохраняем результат, но не отправляем его сразу
  pendingResult.value = finalText
  recognizedText.value = finalText
})

function handleCancel() {
  recognizedText.value = ''
  pendingResult.value = ''
  hasStartedRecording.value = false
  isUserPressingButton.value = false
  if (isRecording.value) {
    stopRecord()
  }
  resetAccumulatedText() // Очищаем накопленный текст
  emit('cancel')
}

function handleRetry() {
  isRetrying.value = true
  recognizedText.value = ''
  pendingResult.value = ''
  hasStartedRecording.value = false
  isUserPressingButton.value = false
  if (isRecording.value) {
    stopRecord()
  }
  resetAccumulatedText() // Очищаем накопленный текст
  
  // Даем время на остановку перед новой попыткой
  setTimeout(() => {
    isRetrying.value = false
  }, 300)
}

async function handleRecordStart(event) {
  if (!isApiAvailable || isRetrying.value) return
  
  // Prevent default behavior to avoid context menu
  if (event) {
    event.preventDefault()
  }
  
  hasStartedRecording.value = true
  isUserPressingButton.value = true // Пользователь начал нажимать кнопку
  pendingResult.value = ''
  
  // Очищаем предыдущий текст при начале новой записи
  if (!isRecording.value) {
    recognizedText.value = ''
    resetAccumulatedText() // Сбрасываем накопленный текст для новой сессии
  }
  
  // На iOS необходимо возобновить AudioContext при каждом пользовательском взаимодействии
  if (isIOS.value && audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume()
    } catch (error) {
      console.error('Ошибка возобновления AudioContext на iOS:', error)
    }
  }
  
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
  
  isUserPressingButton.value = false // Пользователь отпустил кнопку
  
  // Останавливаем запись только при отпускании кнопки
  if (isRecording.value) {
    stopRecord()
  }
  
  // Отправляем результат ВСЕГДА при отпускании кнопки
  setTimeout(() => {
    // Берем либо pendingResult, либо текущий transcript, либо recognizedText
    const resultToSend = pendingResult.value || transcript.value || recognizedText.value
    
    if (resultToSend && resultToSend.trim()) {
      emit('result', resultToSend.trim())
      emit('update:modelValue', false)
    } else {
      // Если нет никакого текста, все равно закрываем оверлей
      emit('update:modelValue', false)
    }
    
    // Очищаем состояния
    pendingResult.value = ''
    recognizedText.value = ''
  }, 150) // Увеличиваем задержку для получения последних результатов
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
        // Для iOS добавляем дополнительные параметры
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
      // Для iOS лучше использовать более низкую частоту дискретизации
      sampleRate: isIOS.value ? 44100 : undefined
    })
    
    // На iOS всегда нужно возобновлять контекст
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
    await stopAudio()
    emit('update:modelValue', false)
  }
}

async function stopAudio() {
  try {
    // Останавливаем анимацию
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    
    // Отключаем source перед закрытием контекста
    if (source) {
      try {
        source.disconnect()
      } catch (error) {
        console.error('Ошибка отключения source:', error)
      }
      source = null
    }
    
    // Закрываем аудио контекст
    if (audioContext && audioContext.state !== 'closed') {
      try {
        await audioContext.close()
      } catch (error) {
        console.error('Ошибка закрытия AudioContext:', error)
      }
    }
    
    // Останавливаем поток медиа
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
        track.enabled = false
      })
      stream = null
    }
    
    // Очищаем ссылки
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
  if (val) {
    recognizedText.value = ''
    hasStartedRecording.value = false
    isRetrying.value = false
    isUserPressingButton.value = false
    resetAccumulatedText() // Очищаем накопленный текст при открытии
    
    // Небольшая задержка для iOS, чтобы дать время на полную очистку предыдущей сессии
    if (isIOS.value) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    await startAudio()
  } else {
    // Останавливаем запись при закрытии оверлея
    if (isRecording.value) {
      stopRecord()
    }
    await stopAudio()
    
    // Даем время на корректное закрытие, особенно важно для iOS
    const cleanupDelay = isIOS.value ? 200 : 100
    setTimeout(() => {
      cleanup()
    }, cleanupDelay)
  }
})

onBeforeUnmount(async () => {
  await stopAudio()
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