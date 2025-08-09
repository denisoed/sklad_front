import { ref, onBeforeUnmount, watch } from 'vue'
import { useSpeechRecognition as useVueUseSpeechRecognition } from '@vueuse/core'

const useSpeechRecognition = () => {
  // Состояния для обратной совместимости
  const transcript = ref('')
  const isRecording = ref(false)
  const isApiAvailable = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  
  // Внутренние переменные для управления состоянием
  let finishCallback = null
  let isDestroyed = ref(false)
  let recognitionTimeout = null
  let shouldContinueRecording = null
  let accumulatedText = ''
  let currentSessionText = ''
  let lastProcessedResult = ''
  
  // Инициализируем VueUse SpeechRecognition
  const {
    isSupported,
    isListening,
    result,
    start: vueUseStart,
    stop: vueUseStop,
    recognition
  } = useVueUseSpeechRecognition({
    lang: 'ru-RU',
    interimResults: true,
    continuous: !isIOS, // iOS Safari плохо работает с continuous=true
    maxAlternatives: 1
  })

  // Синхронизируем состояния
  watch(isListening, (newValue) => {
    isRecording.value = newValue
  })

  // Используем VueUse result напрямую, но с правильной логикой
  watch(result, (newText) => {
    if (!newText || isDestroyed.value) return
    
    // Если это тот же результат, игнорируем
    if (newText === lastProcessedResult) return
    
    // Обновляем текущий текст сессии
    currentSessionText = newText
    lastProcessedResult = newText
    
    // Показываем комбинацию накопленного + текущего текста
    transcript.value = accumulatedText ? `${accumulatedText} ${currentSessionText}` : currentSessionText
    
  })

  // Следим за окончанием записи
  watch(isListening, (listening) => {
    if (!listening && !isDestroyed.value) {
      // Очищаем таймаут при нормальном завершении
      if (recognitionTimeout) {
        clearTimeout(recognitionTimeout)
        recognitionTimeout = null
      }
      
      // При остановке записи сохраняем текущий результат как финальный
      if (currentSessionText.trim()) {
        accumulatedText = accumulatedText ? accumulatedText + ' ' + currentSessionText.trim() : currentSessionText.trim()
        transcript.value = accumulatedText
        
        // Вызываем callback для финального результата
        if (finishCallback) {
          finishCallback(accumulatedText.trim())
        }
        
        // Сбрасываем текущий текст сессии после добавления в накопленный
        currentSessionText = ''
        lastProcessedResult = ''
      }
      
      // Продолжаем запись, только если кнопка все еще зажата
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
      // Очищаем только текст текущей сессии при каждом старте
      currentSessionText = ''
      
      // Для iOS обновляем таймаут на случай перезапуска
      if (isIOS) {
        if (recognitionTimeout) {
          clearTimeout(recognitionTimeout)
        }
        recognitionTimeout = setTimeout(() => {
          // На iOS перезапуск через таймаут, если кнопка все еще зажата
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
      console.error('Ошибка начала записи:', error)
      
      // Если произошла ошибка, попробуем переинициализировать
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
    
    // Очищаем таймаут
    if (recognitionTimeout) {
      clearTimeout(recognitionTimeout)
      recognitionTimeout = null
    }
    
    try {
      if (isRecording.value) {
        vueUseStop()
      }
    } catch (error) {
      console.error('Ошибка остановки записи:', error)
      isRecording.value = false
    }
  }

  function cleanup() {
    // Очищаем таймаут
    if (recognitionTimeout) {
      clearTimeout(recognitionTimeout)
      recognitionTimeout = null
    }
    
    try {
      if (isRecording.value) {
        vueUseStop()
      }
    } catch (error) {
      console.error('Ошибка очистки recognition:', error)
    }
    
    isRecording.value = false
    // НЕ очищаем transcript и накопленный текст здесь
  }

  function destroy() {
    isDestroyed.value = true
    cleanup()
    finishCallback = null
    shouldContinueRecording = null
    // Очищаем все при уничтожении
    accumulatedText = ''
    currentSessionText = ''
    transcript.value = ''
  }

  // Функция для сброса накопленного текста (вызывается при начале новой записи)
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

  // Автоматическая очистка при размонтировании компонента
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