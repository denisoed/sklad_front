<template>
  <div v-if="isShowVoiceOverlay" class="voice-overlay flex flex-center flex-col">
    <q-btn
      color="negative"
      push
      round
      icon="mdi-close"
      @click="handleClose"
      class="absolute-top-right q-mt-md q-mr-md"
    />

    <slot name="header" />

    <div class="voice-placeholder q-mb-md text-warning">
      <span v-if="!isApiAvailable" class="text-red q-mb-md">
        {{ $t('voiceOverlay.recognitionUnavailable') }}
      </span>
      <span v-else-if="!hasStartedRecording" class="text-bold">
        {{ $t('voiceOverlay.pressButtonToStart') }}
      </span>
      <span v-else-if="isUserPressingButton && !recognizedText" class="text-bold">{{ $t('voiceOverlay.speakNow') }}</span>
      <span v-else-if="recognizedText" class="text-bold">{{ recognizedText }}</span>
      <span v-else class="text-bold">{{ $t('voiceOverlay.pressButtonToStart') }}</span>
    </div>
    
    <!-- Recording button -->
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

    <slot name="footer" />
    
    <canvas ref="canvasRef" class="voice-canvas" width="480" height="240"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import useSpeechRecognition from '../modules/useSpeechRecognition'
import useHelpers from '../modules/useHelpers'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // If false, overlay will NOT auto-close after recording stops
  autoClose: {
    type: Boolean,
    default: true
  },
  // Emit interim results while holding record button, in milliseconds (0 disables)
  throttleMs: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['result', 'close'])

const { t: $t } = useI18n()
const { showError } = useHelpers()

// Constants
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
const isShowVoiceOverlay = ref(true)

// Guard to prevent duplicate close event emission
let hasEmittedClose = false

// Audio context and related variables
let audioContext = null
let analyser = null
let dataArray = null
let source = null
let animationId = null
let stream = null
let isAudioInitialized = false
// Throttled interim result emission
let throttleTimerId = null
let lastThrottledResult = ''

// Create an instance of speech recognition
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

// Set callback to check if recording should continue
setShouldContinueCallback(() => isUserPressingButton.value)

// Normalize thousand separators without touching real decimals
function normalizeThousandSeparators(text) {
  if (!text || typeof text !== 'string') return text
  // Remove thin/non-breaking spaces inside digit groups like "5 000" or "5 000"
  let result = text.replace(/\u00A0|\u202F/g, ' ')
  // Collapse space-grouped thousands: 1 234 567 -> 1234567
  result = result.replace(/\b(\d{1,3}(?:[ \u00A0\u202F]\d{3})+)\b/g, (m) => m.replace(/[ \u00A0\u202F]/g, ''))
  // Collapse dot-grouped thousands: 1.234.567 -> 1234567 (does not match decimals like 12.34)
  result = result.replace(/\b(\d{1,3}(?:\.\d{3})+)\b/g, (m) => m.replace(/\./g, ''))
  // Collapse comma-grouped thousands: 1,234,567 -> 1234567 (does not match decimals like 12,34)
  result = result.replace(/\b(\d{1,3}(?:,\d{3})+)\b/g, (m) => m.replace(/,/g, ''))
  return result
}

// Create a reusable finish handler to rebind after restore()
const finishHandler = (finalText) => {
  if (isRetrying.value) {
    return
  }
  recognizedText.value = normalizeThousandSeparators(finalText)
  // Do not remove loader on result - only on close
}

// Register finish handler initially
onFinish(finishHandler)

// Cleanup function without event emission
async function cleanup() {
  // Block all callbacks to prevent restart
  setShouldContinueCallback(() => false)
  
  // Reset all states
  isUserPressingButton.value = false
  // Stop throttled emission
  stopThrottledEmit()
  
  // Force stop recording
  if (isRecording.value) {
    stopRecord()
  }
  
  // Wait for recording to finish
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Full audio resource cleanup
  await stopAudio()
  
  // Destroy speech recognition instance
  destroy()
  

}

async function handleClose() {
  // Prevent duplicate close event emission
  if (hasEmittedClose) {
    return
  }

  isShowVoiceOverlay.value = false
  hasEmittedClose = true
  
  try {
    // Perform cleanup
    await cleanup()
    
    emit('close')
  } catch (error) {
    console.error('Error during cleanup:', error)
    // Reset flag on cleanup failure to allow retry
    hasEmittedClose = false
    throw error
  }
}

function handleRetry() {
  isRetrying.value = true
  
  // Reset close flag to allow proper closing after retry
  hasEmittedClose = false
  
  // Full state reset
  recognizedText.value = ''
  hasStartedRecording.value = false
  isUserPressingButton.value = false
  isProcessing.value = false
  lastThrottledResult = ''
  
  // Block recording continuation during reset
  setShouldContinueCallback(() => false)
  
  if (isRecording.value) {
    stopRecord()
  }
  
  // Reset accumulated text in the speech module
  resetAccumulatedText()
  
  setTimeout(() => {
    isRetrying.value = false
    // Rebind callback after reset
    setShouldContinueCallback(() => isUserPressingButton.value)
  }, TIMEOUTS.RETRY_DELAY)
}

async function handlePointerDown(event) {
  if (!isApiAvailable || isRetrying.value) return
  if (event) event.preventDefault()
  
  hasStartedRecording.value = true
  isUserPressingButton.value = true
  // Start emitting interim results on throttle, if enabled
  startThrottledEmit()

  // Clear text on new recording start
  if (!isRecording.value) {
    recognizedText.value = ''
    resetAccumulatedText()
  }

  // Prepare audio visualization on demand
  if (!isAudioInitialized) {
    try {
      await startAudio()
    } catch (error) {
      // startAudio failed and already handled cleanup/close
      return
    }
  } else if (isIOS.value && audioContext && audioContext.state === 'suspended') {
    try { await audioContext.resume() } catch (error) { console.error('AudioContext resume iOS error:', error) }
  }

  // Check if component is still active after potential startAudio failure
  if (hasEmittedClose || !isAudioInitialized) {
    return
  }

  if (!isRecording.value) {
    startRecord()
  }
}

// Get result for submission
function getResult() {
  const raw = (transcript.value || recognizedText.value || '').trim()
  return normalizeThousandSeparators(raw)
}

// Throttled emission helpers
function emitInterimResultIfChanged() {
  const resultToSend = getResult()
  if (!resultToSend) return
  if (resultToSend === lastThrottledResult) return
  lastThrottledResult = resultToSend
  emit('result', resultToSend)
}

function startThrottledEmit() {
  if (!props.throttleMs || props.throttleMs <= 0) return
  stopThrottledEmit()
  lastThrottledResult = ''
  throttleTimerId = setInterval(() => {
    if (!isUserPressingButton.value) return
    emitInterimResultIfChanged()
  }, props.throttleMs)
}

function stopThrottledEmit() {
  if (throttleTimerId) {
    clearInterval(throttleTimerId)
    throttleTimerId = null
  }
}

function submitIfNeededAndClose() {
  const resultToSend = getResult()
  if (resultToSend) {
    emit('result', resultToSend)
  }
  if (props.autoClose) {
    handleClose()
  } else {
    // Keep overlay open for subsequent recordings
    isProcessing.value = false
  }
}

// General recording finish logic
async function finishRecording(isCancel = false) {
  isUserPressingButton.value = false
  isProcessing.value = true
  // Stop interim emissions
  stopThrottledEmit()

  if (isCancel) {
    // Block recording continuation on cancellation
    setShouldContinueCallback(() => false)
    if (props.autoClose) {
      await handleClose()
      return
    } else {
      await stopAudio()
      isProcessing.value = false
      return
    }
  }

  if (isRecording.value) {
    stopRecord()
  }

  await stopAudio()

  // Small delay to allow final results to arrive
  setTimeout(() => {
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
  // If finger/cursor leaves, consider it as a release
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
    console.error('Error during visualization drawing:', error)
  }
}

// Get audio constraints for different platforms
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

// Create and configure AudioContext
function createAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  return new AudioContextClass({
    sampleRate: isIOS.value ? AUDIO_CONFIG.SAMPLE_RATE : undefined
  })
}

// Setup audio analyzer
function setupAnalyser(audioContext) {
  const analyser = audioContext.createAnalyser()
  analyser.fftSize = AUDIO_CONFIG.FFT_SIZE
  analyser.smoothingTimeConstant = AUDIO_CONFIG.SMOOTHING
  return analyser
}

// Handle microphone access errors with informative messages
function handleMicrophoneError(error) {
  const errorName = error.name || error.constructor?.name || 'UnknownError'
  
  switch (errorName) {
    case 'NotAllowedError':
      showError($t('voice.microphoneError'))
      break
    case 'PermissionDeniedError':
      showError($t('voice.dialogClosed'))
      break
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      showError($t('voice.micNotFound'))
      break
    case 'NotReadableError':
    case 'TrackStartError':
      showError($t('voice.micInUse'))
      break
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      showError($t('voice.micNotSupported'))
      break
    case 'SecurityError':
      showError($t('voice.micInUse'))
      break
    case 'TypeError':
      showError($t('voice.configError'))
      break
    default:
      showError($t('voice.accessError'))
  }
}

async function startAudio() {
  // Full cleanup before new initialization
  if (isAudioInitialized) {
    await stopAudio()
  }

  try {
    // Request microphone access
    stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints())
    
    // Create a new AudioContext for each session
    audioContext = createAudioContext()
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
    
    // Setup analyzer
    analyser = setupAnalyser(audioContext)
    dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    // Connect source
    source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)
    
    isAudioInitialized = true
    
    await nextTick()
    drawBars()
    
  } catch (e) {
    console.error('Microphone access error:', e)
    await stopAudio()
    // Show informative error to user based on error type
    handleMicrophoneError(e)
    // Close overlay on microphone access error
    await handleClose()
    // Re-throw error to signal failure to callers
    throw e
  }
}

async function stopAudio() {
  try {
    // Stop interim emissions when audio stops
    stopThrottledEmit()
    // Stop animation
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    
    // Disconnect source from analyser
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
        console.error('Error disconnecting source:', error) 
      }
      source = null
    }
    
    // Force close AudioContext
    if (audioContext) {
      try { 
        if (audioContext.state !== 'closed') {
          // On iOS, first suspend, then close
          if (audioContext.state === 'running') {
            await audioContext.suspend()
          }
          await audioContext.close() 
        }
      } catch (error) { 
        console.error('Error closing AudioContext:', error) 
      }
      audioContext = null
    }
    
    // Force stop all media stream tracks
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          track.stop()
          track.enabled = false
          // Additional cleanup for iOS
          if (track.readyState !== 'ended') {
            track.stop()
          }
        } catch (error) {
          console.error('Error stopping track:', error)
        }
      })
      stream = null
    }
    
    // Reset all related variables
    analyser = null
    dataArray = null
    isAudioInitialized = false
    
    // Additional canvas cleanup
    if (canvasRef.value) {
      const canvas = canvasRef.value
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    
  } catch (error) {
    console.error('Error during audio stop:', error)
  }
}

// Watch transcript changes to update display
watch(transcript, (newText) => {
  if (newText) {
    recognizedText.value = normalizeThousandSeparators(newText)
  }
})

// Additional protection - forced cleanup on tab/browser close
function handleBeforeUnload() {
  setShouldContinueCallback(() => false)
  if (isRecording.value) {
    stopRecord()
  }
  destroy()
}

// Visibility change handler for tab
function handleVisibilityChange() {
  if (document.hidden) {
    // If tab is hidden and overlay is open - force close
    handleClose()
  }
}

// Component initialization on mount
onMounted(async () => {
  // Reset close flag for component reuse scenarios
  hasEmittedClose = false
  isShowVoiceOverlay.value = true
  
  // Set event listeners
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Initialize state
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
  
  try {
    await startAudio()
  } catch (error) {
    // startAudio failed and already handled cleanup/close
    // Component will be closed, no further initialization needed
    return
  }
})

onBeforeUnmount(async () => {
  // Clear event listeners
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  
  // Perform only resource cleanup without event emission
  await cleanup()
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
  backdrop-filter: blur(6px);
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
  font-size: 16px;
  color: #fff;
  margin-bottom: 24px;
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.90);
  backdrop-filter: blur(6px);
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