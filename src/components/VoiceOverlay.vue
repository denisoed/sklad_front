<template>
  <transition name="fade">
    <teleport to="body">
      <div v-if="modelValue" class="voice-overlay flex flex-center flex-col">
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
          <span v-else-if="!recognizedText && !isRecording" class="text-bold text-red">
            Не удалось распознать речь. Попробуйте сказать еще раз...
          </span>
          <span v-else-if="!recognizedText" class="text-bold">Говорите...</span>
          <span v-else>{{ recognizedText }}</span>
        </div>
        <q-btn
          v-if="recognizedText || isRecording"
          color="negative"
          push
          label="Отмена"
          @click="handleCancel"
        />
        <q-btn
          v-else
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
import { ref, watch, onBeforeUnmount } from 'vue'
import useSpeechRecognition from '../modules/useSpeechRecognition'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['cancel', 'update:modelValue', 'result', 'colorResult'])

const canvasRef = ref(null)
const recognizedText = ref('')
const isRetrying = ref(false)

let audioContext = null
let analyser = null
let dataArray = null
let source = null
let animationId = null
let stream = null

const { isRecording, isApiAvailable, toggleRecord, onFinish, transcript } = useSpeechRecognition()

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
  if (isRecording.value) {
    toggleRecord()
  }
  emit('cancel')
}

function handleRetry() {
  isRetrying.value = true
  recognizedText.value = ''
  if (isRecording.value) {
    toggleRecord()
  }
  setTimeout(() => {
    toggleRecord()
    setTimeout(() => {
      isRetrying.value = false
    }, 300)
  }, 100)
}

function drawBars() {
  const canvas = canvasRef.value
  if (!canvas || !analyser) return
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
}

async function startAudio() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 64
    dataArray = new Uint8Array(analyser.frequencyBinCount)
    source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)
    drawBars()
    
    if (isApiAvailable) {
      toggleRecord()
    }
  } catch (e) {
    console.error('Ошибка доступа к микрофону:', e)
    emit('update:modelValue', false)
  }
}

function stopAudio() {
  if (animationId) cancelAnimationFrame(animationId)
  if (audioContext) audioContext.close()
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  audioContext = null
  analyser = null
  dataArray = null
  source = null
  stream = null
}

watch(transcript, (newText) => {
  if (newText) {
    recognizedText.value = newText
  }
})

watch(() => props.modelValue, (val) => {
  if (val) {
    recognizedText.value = ''
    startAudio()
  } else {
    stopAudio()
  }
})

onBeforeUnmount(() => {
  stopAudio()
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
  backdrop-filter: blur(10px);
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