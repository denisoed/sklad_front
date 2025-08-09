<template>
  <div class="voice-overlay flex flex-center flex-col">
    <q-btn
      color="negative"
      push
      round
      icon="mdi-close"
      @click="handleClose"
      class="absolute-top-right q-mt-md q-mr-md"
    />

    <div class="voice-placeholder q-mb-md">
      <span v-if="!isApiAvailable" class="text-red q-mb-md">
        Распознавание речи недоступно в вашем браузере
      </span>
      <span v-else-if="!hasStartedRecording" class="text-bold">
        Зажмите кнопку ниже, чтобы начать запись
      </span>
      <span v-else-if="shouldShowErrorMessage" class="text-bold text-red">
        Не удалось распознать речь. Попробуйте сказать еще раз...
      </span>
      <span v-else-if="!recognizedText" class="text-bold">Говорите...</span>
      <span v-else>{{ recognizedText }}</span>
    </div>
    
    <!-- Кнопка записи -->
    <div class="record-button-container">
      <q-btn
        v-if="isApiAvailable"
        :color="isUserPressingButton ? 'negative' : 'primary'"
        :icon="isUserPressingButton ? 'stop' : 'mic'"
        :loading="isProcessing"
        :disable="isProcessing"
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
      v-if="shouldShowRetryButton"
      color="primary"
      push
      label="Заново"
      @click="handleRetry"
    />
    
    <canvas ref="canvasRef" class="voice-canvas" width="480" height="240"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import useSpeechRecognition from '../modules/useSpeechRecognition'

const emit = defineEmits(['close', 'result'])

// Константы
const TIMEOUTS = {
  RETRY_DELAY: 300,
  RESULT_DELAY: 150,
  IOS_STOP_DELAY: 150,
  ANDROID_STOP_DELAY: 100,
  MOUNT_DELAY: 100,
  UNMOUNT_DELAY: 150
}

const AUDIO_CONFIG = {
  SAMPLE_RATE: 44100,
  CHANNEL_COUNT: 1,
  FFT_SIZE: 64,
  SMOOTHING: 0.8,
  BAR_COUNT: 32
}

const canvasRef = ref(null)
const recognizedText = ref('')
const isRetrying = ref(false)
const hasStartedRecording = ref(false)
const isIOS = ref(/iPad|iPhone|iPod/.test(navigator.userAgent))
const isUserPressingButton = ref(false)
const isProcessing = ref(false)

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
  setShouldContinueCallback,
  resetAccumulatedText,
  destroy,
  restore
} = speechRecognition

// Computed свойства для сложных условий в template
const shouldShowErrorMessage = computed(() => 
  !recognizedText.value && !isRecording.value && !isUserPressingButton.value
)

const shouldShowRetryButton = computed(() => 
  hasStartedRecording.value && !recognizedText.value && !isRecording.value && !isUserPressingButton.value
)

// Устанавливаем callback для проверки, нужно ли продолжать запись
setShouldContinueCallback(() => isUserPressingButton.value)

// Create a reusable finish handler to rebind after restore()
const finishHandler = (finalText) => {
  if (isRetrying.value) {
    return
  }
  recognizedText.value = finalText
  isProcessing.value = false
}

// Register finish handler initially
onFinish(finishHandler)

async function handleClose() {
  // Блокируем все колбэки для предотвращения перезапуска
  setShouldContinueCallback(() => false)
  
  // Сбрасываем все состояния
  recognizedText.value = ''
  hasStartedRecording.value = false
  isUserPressingButton.value = false
  isProcessing.value = false
  isRetrying.value = false
  
  // Принудительно останавливаем запись
  if (isRecording.value) {
    stopRecord()
  }
  
  // Ждем завершения остановки записи
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Полная очистка аудио ресурсов
  await stopAudio()
  
  // Уничтожаем экземпляр распознавания речи
  destroy()
  
  // Инкрементируем счетчик жизненного цикла для отмены async операций
  lifecycleSeq++
  
  emit('close')
}

function handleRetry() {
  isRetrying.value = true
  
  // Полная очистка состояний
  recognizedText.value = ''
  hasStartedRecording.value = false
  isUserPressingButton.value = false
  isProcessing.value = false
  
  // Блокируем продолжение записи на время сброса
  setShouldContinueCallback(() => false)
  
  if (isRecording.value) {
    stopRecord()
  }
  
  // Сбрасываем накопленный текст в модуле речи
  resetAccumulatedText()
  
  setTimeout(() => {
    isRetrying.value = false
    // Восстанавливаем callback после сброса
    setShouldContinueCallback(() => isUserPressingButton.value)
  }, TIMEOUTS.RETRY_DELAY)
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

// Проверка наличия результата
function hasResult() {
  return !!(recognizedText.value || transcript.value)
}

// Получение результата для отправки
function getResult() {
  return (transcript.value || recognizedText.value || '').trim()
}

function submitIfNeededAndClose() {
  const resultToSend = getResult()
  if (resultToSend) {
    emit('result', resultToSend)
    handleClose()
  }
  recognizedText.value = ''
}

// Общая логика завершения записи
async function finishRecording(isCancel = false) {
  isUserPressingButton.value = false
  isProcessing.value = true

  if (isCancel) {
    // Блокируем продолжение записи при отмене
    setShouldContinueCallback(() => false)
  }

  if (isRecording.value) {
    stopRecord()
  }

  // Ждем завершения для iOS при отмене
  if (isCancel) {
    await new Promise(resolve => setTimeout(resolve, isIOS.value ? TIMEOUTS.IOS_STOP_DELAY : TIMEOUTS.ANDROID_STOP_DELAY))
  }

  await stopAudio()

    // Небольшая задержка, чтобы дать доехать финальным результатам
  setTimeout(() => {
    // Проверяем, есть ли результат, если нет - убираем loading (это означает ошибку)
    if (!hasResult()) {
      isProcessing.value = false
    }
    submitIfNeededAndClose()
  }, TIMEOUTS.RESULT_DELAY)
}

async function handlePointerUp(event) {
  if (!isApiAvailable || isRetrying.value) return
  if (event) event.preventDefault()

  await finishRecording(false)
}

async function handlePointerCancel(event) {
  if (event) event.preventDefault()
  
  await finishRecording(true)
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
    const barWidth = WIDTH / AUDIO_CONFIG.BAR_COUNT
    
    for (let i = 0; i < AUDIO_CONFIG.BAR_COUNT; i++) {
      const dataIdx = Math.floor(i * dataArray.length / AUDIO_CONFIG.BAR_COUNT)
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
    }
    
    ctx.restore()
    animationId = requestAnimationFrame(drawBars)
  } catch (error) {
    console.error('Ошибка при отрисовке визуализации:', error)
  }
}

// Получение аудио constraints для разных платформ
function getAudioConstraints() {
  return {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      ...(isIOS.value && {
        sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
        channelCount: AUDIO_CONFIG.CHANNEL_COUNT
      })
    }
  }
}

// Создание и настройка AudioContext
function createAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  return new AudioContextClass({
    sampleRate: isIOS.value ? AUDIO_CONFIG.SAMPLE_RATE : undefined
  })
}

// Настройка анализатора аудио
function setupAnalyser(audioContext) {
  const analyser = audioContext.createAnalyser()
  analyser.fftSize = AUDIO_CONFIG.FFT_SIZE
  analyser.smoothingTimeConstant = AUDIO_CONFIG.SMOOTHING
  return analyser
}

async function startAudio() {
  // Полная очистка перед новой инициализацией
  if (isAudioInitialized) {
    await stopAudio()
  }

  try {
    // Запрашиваем доступ к микрофону
    stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints())
    
    // Создаем новый AudioContext для каждой сессии
    audioContext = createAudioContext()
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
    
    // Настраиваем анализатор
    analyser = setupAnalyser(audioContext)
    dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    // Подключаем источник
    source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)
    
    isAudioInitialized = true
    
    await nextTick()
    drawBars()
    
  } catch (e) {
    console.error('Ошибка доступа к микрофону:', e)
    await stopAudio()
  }
}

async function stopAudio() {
  try {
    // Останавливаем анимацию
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    
    // Отключаем source от analyser
    if (source) {
      try { 
        source.disconnect() 
        if (source.mediaStream) {
          source.mediaStream.getTracks().forEach(track => {
            track.stop()
            track.enabled = false
          })
        }
      } catch (error) { 
        console.error('Ошибка отключения source:', error) 
      }
      source = null
    }
    
    // Закрываем AudioContext принудительно
    if (audioContext) {
      try { 
        if (audioContext.state !== 'closed') {
          // На iOS нужно сначала suspend, потом close
          if (audioContext.state === 'running') {
            await audioContext.suspend()
          }
          await audioContext.close() 
        }
      } catch (error) { 
        console.error('Ошибка закрытия AudioContext:', error) 
      }
      audioContext = null
    }
    
    // Принудительно останавливаем все треки медиа потока
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          track.stop()
          track.enabled = false
          // Дополнительная очистка для iOS
          if (track.readyState !== 'ended') {
            track.stop()
          }
        } catch (error) {
          console.error('Ошибка остановки трека:', error)
        }
      })
      stream = null
    }
    
    // Сбрасываем все связанные переменные
    analyser = null
    dataArray = null
    isAudioInitialized = false
    
    // Дополнительная очистка canvas
    if (canvasRef.value) {
      const canvas = canvasRef.value
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    
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

// Дополнительная защита - принудительная очистка при закрытии вкладки/браузера
function handleBeforeUnload() {
  setShouldContinueCallback(() => false)
  if (isRecording.value) {
    stopRecord()
  }
  destroy()
}

// Обработчик смены видимости вкладки
function handleVisibilityChange() {
  if (document.hidden) {
    // Если вкладка скрылась и overlay открыт - принудительно закрываем
    handleClose()
  }
}

// Инициализация компонента при монтировании
onMounted(async () => {
  const seq = ++lifecycleSeq
  
  // Устанавливаем обработчики событий
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Инициализируем состояние
  recognizedText.value = ''
  hasStartedRecording.value = false
  isRetrying.value = false
  isUserPressingButton.value = false
  isProcessing.value = false
  
  // Restore after full teardown (relevant for iOS fresh instance)
  restore()
  // Rebind finish handler after restore
  onFinish(finishHandler)
  resetAccumulatedText()
  
  // Bind should-continue callback immediately to avoid gaps on iOS
  setShouldContinueCallback(() => isUserPressingButton.value)
  
  if (isIOS.value) {
    await new Promise(resolve => setTimeout(resolve, TIMEOUTS.MOUNT_DELAY))
  }
  
  // If component was unmounted while awaiting, abort this initialization flow
  if (seq !== lifecycleSeq) {
    return
  }
  
  await startAudio()
})

onBeforeUnmount(async () => {
  // Очищаем обработчики событий
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  
  // Используем handleClose для правильной очистки всех ресурсов
  await handleClose()
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
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 2;
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
  position: fixed;
  left: 0;
  bottom: -60px;
  width: 100%;
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