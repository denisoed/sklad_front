import { ref, onBeforeUnmount, watch } from 'vue'
import { useSpeechRecognition as useVueUseSpeechRecognition } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const useSpeechRecognition = () => {
  const { t } = useI18n({ useScope: 'global' })
  // States for backward compatibility
  const transcript = ref('')
  const isRecording = ref(false)
  const isApiAvailable = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  
  // Internal variables for state management
  let finishCallback = null
  let isDestroyed = ref(false)
  let recognitionTimeout = null
  let shouldContinueRecording = null
  let accumulatedText = ''
  let currentSessionText = ''
  let lastProcessedResult = ''
  
  // Initialize VueUse SpeechRecognition
  const {
    isSupported,
    isListening,
    result,
    start: vueUseStart,
    stop: vueUseStop,
    recognition
  } = useVueUseSpeechRecognition({
    lang: t('lang'),
    interimResults: true,
    continuous: !isIOS, // iOS Safari doesn't work well with continuous=true
    maxAlternatives: 1
  })

  // Synchronize states
  watch(isListening, (newValue) => {
    isRecording.value = newValue
  })

  // Use VueUse result directly, but with correct logic
  watch(result, (newText) => {
    if (!newText || isDestroyed.value) return
    
    // If it's the same result, ignore
    if (newText === lastProcessedResult) return
    
    // Update current session text
    currentSessionText = newText
    lastProcessedResult = newText
    
    // Show combination of accumulated + current text
    transcript.value = accumulatedText ? `${accumulatedText} ${currentSessionText}` : currentSessionText
    
  })

  // Watch for recording end
  watch(isListening, (listening) => {
    if (!listening && !isDestroyed.value) {
      // Clear timeout on normal completion
      if (recognitionTimeout) {
        clearTimeout(recognitionTimeout)
        recognitionTimeout = null
      }
      
      // On recording stop, save current result as final
      if (currentSessionText.trim()) {
        accumulatedText = accumulatedText ? accumulatedText + ' ' + currentSessionText.trim() : currentSessionText.trim()
        transcript.value = accumulatedText
        
        // Call callback for final result
        if (finishCallback) {
          finishCallback(accumulatedText.trim())
        }
        
        // Reset current session text after adding to accumulated
        currentSessionText = ''
        lastProcessedResult = ''
      }
      
      // Continue recording only if button is still pressed
      if (shouldContinueRecording && shouldContinueRecording()) {
        setTimeout(() => {
          if (!isDestroyed.value && shouldContinueRecording && shouldContinueRecording()) {
            startRecord()
          }
        }, 100)
      }
    }
  })

  function onFinish(callback) {
    finishCallback = callback
  }

  function setShouldContinueCallback(callback) {
    shouldContinueRecording = callback
  }

  function startRecord() {
    if (isDestroyed.value || !isApiAvailable) return
    
    try {
      // Clear only current session text on each start
      currentSessionText = ''
      
      // For iOS, update timeout in case of restart
      if (isIOS) {
        if (recognitionTimeout) {
          clearTimeout(recognitionTimeout)
        }
        recognitionTimeout = setTimeout(() => {
          // On iOS, restart via timeout if button is still pressed
          if (shouldContinueRecording && shouldContinueRecording()) {
            stopRecord()
            setTimeout(() => startRecord(), 120)
          } else {
            stopRecord()
          }
        }, 12000)
      }
      
      if (!isRecording.value) {
        vueUseStart()
      }
    } catch (error) {
      console.error('Error starting recording:', error)
      
      // If an error occurred, try to re-initialize
      const retryDelay = isIOS ? 300 : 120
      setTimeout(() => {
        if (!isDestroyed.value && shouldContinueRecording && shouldContinueRecording()) {
          startRecord()
        }
      }, retryDelay)
    }
  }

  function stopRecord() {
    if (isDestroyed.value) return
    
    // Clear timeout
    if (recognitionTimeout) {
      clearTimeout(recognitionTimeout)
      recognitionTimeout = null
    }
    
    try {
      if (isRecording.value) {
        vueUseStop()
      }
    } catch (error) {
      console.error('Error stopping recording:', error)
      isRecording.value = false
    }
  }

  function cleanup() {
    // Clear timeout
    if (recognitionTimeout) {
      clearTimeout(recognitionTimeout)
      recognitionTimeout = null
    }
    
    try {
      if (isRecording.value) {
        vueUseStop()
      }
    } catch (error) {
      console.error('Error cleaning up recognition:', error)
    }
    
    isRecording.value = false
    // Do not clear transcript and accumulated text here
  }

  function destroy() {
    isDestroyed.value = true
    cleanup()
    finishCallback = null
    shouldContinueRecording = null
    // Clear everything on destruction
    accumulatedText = ''
    currentSessionText = ''
    transcript.value = ''
  }

  // Function to reset accumulated text (called when starting a new recording)
  function resetAccumulatedText() {
    accumulatedText = ''
    currentSessionText = ''
    transcript.value = ''
  }

  // Allows restoring the composable after destroy() without remounting the component
  function restore() {
    // Ensure a clean slate in case destroy() wasn't called
    cleanup()
    // Clear destruction flag so startRecord() can work again
    isDestroyed.value = false
    // Reset text state
    accumulatedText = ''
    currentSessionText = ''
    transcript.value = ''
    // Leave callbacks empty; the caller will set them if needed
    finishCallback = null
    shouldContinueRecording = null
  }

  // Automatic cleanup on component unmount
  onBeforeUnmount(() => {
    destroy()
  })

  return {
    isRecording,
    isApiAvailable: isSupported,
    startRecord,
    stopRecord,
    onFinish,
    transcript,
    destroy,
    cleanup,
    setShouldContinueCallback,
    resetAccumulatedText,
    restore
  }
}

export default useSpeechRecognition 