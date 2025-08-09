import { ref, onBeforeUnmount } from 'vue'

const useSpeechRecognition = () => {
  const transcript = ref('')
  const isRecording = ref(false)
  const isApiAvailable = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  
  // Создаем новый экземпляр для каждого использования
  let recognition = null
  let finishCallback = null
  let isDestroyed = ref(false)
  let recognitionTimeout = null
  let shouldContinueRecording = null // Callback для проверки, нужно ли продолжать запись
  let accumulatedText = '' // Накопленный текст из предыдущих сессий
  let currentSessionText = '' // Текст текущей сессии

  function initializeRecognition() {
    if (!isApiAvailable || recognition) {
      return
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognition()
      
      recognition.lang = 'ru-RU'
      recognition.interimResults = true
      // iOS Safari плохо работает с continuous=true. Для стабильности выключаем.
      recognition.continuous = !isIOS
      recognition.maxAlternatives = 1

      recognition.onstart = onStart
      recognition.onend = onEnd
      recognition.onresult = onResult
      recognition.onerror = onError
      recognition.onnomatch = onNoMatch
    } catch (error) {
      console.error('Ошибка инициализации распознавания речи:', error)
    }
  }

  function onFinish(callback) {
    finishCallback = callback
  }

  function setShouldContinueCallback(callback) {
    shouldContinueRecording = callback
  }

  function startRecord() {
    if (isDestroyed.value) return
    
    try {
      // На iOS принудительно очищаем старый экземпляр только если это первый запуск
      if (isIOS && recognition && !isRecording.value) {
        // Проверяем, нужна ли очистка (если recognition в нерабочем состоянии)
        try {
          const recognitionState = recognition.serviceState || 'unknown'
          if (recognitionState === 'failed' || recognitionState === 'error') {
            cleanupRecognition()
          }
        } catch (e) {
          cleanupRecognition()
        }
      }
      
      if (!recognition) {
        initializeRecognition()
      }
      
      if (recognition && !isRecording.value) {
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
        
        recognition.start()
      }
    } catch (error) {
      console.error('Ошибка начала записи:', error)
      // Если произошла ошибка, попробуем переинициализировать
      cleanupRecognition()
      
      const retryDelay = isIOS ? 300 : 120
      setTimeout(() => {
        if (!isDestroyed.value && shouldContinueRecording && shouldContinueRecording()) {
          initializeRecognition()
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
      if (recognition && isRecording.value) {
        recognition.stop()
      }
    } catch (error) {
      console.error('Ошибка остановки записи:', error)
      // Пробуем аварийную остановку
      try {
        recognition && recognition.abort && recognition.abort()
      } catch (_) {}
      isRecording.value = false
    }
  }

  function onStart() {
    if (isDestroyed.value) return
    isRecording.value = true
  }

  function onEnd() {
    if (isDestroyed.value) return
    isRecording.value = false
    
    // Очищаем таймаут при нормальном завершении
    if (recognitionTimeout) {
      clearTimeout(recognitionTimeout)
      recognitionTimeout = null
    }
    
    // Сохраняем текст текущей сессии в накопленный текст
    if (currentSessionText.trim()) {
      accumulatedText = accumulatedText ? accumulatedText + ' ' + currentSessionText.trim() : currentSessionText.trim()
      transcript.value = accumulatedText
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

  function onResult(event) {
    if (isDestroyed.value) return
    
    let finalTranscript = ''
    let interimTranscript = ''
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      if (result.isFinal) {
        finalTranscript += result[0].transcript
      } else {
        interimTranscript += result[0].transcript
      }
    }
    
    // Обновляем текст текущей сессии
    if (finalTranscript) {
      currentSessionText += finalTranscript
    }
    
    // Показываем комбинацию накопленного + текущего + промежуточного текста
    const currentDisplay = currentSessionText + (interimTranscript || '')
    transcript.value = accumulatedText ? `${accumulatedText} ${currentDisplay}` : currentDisplay
    
    // Если есть финальный результат, вызываем callback
    if (finalTranscript && finishCallback) {
      const fullText = accumulatedText ? `${accumulatedText} ${currentSessionText}` : currentSessionText
      finishCallback(fullText.trim())
    }
  }

  function onError(event) {
    if (isDestroyed.value) return
    
    // Очищаем таймаут при ошибке
    if (recognitionTimeout) {
      clearTimeout(recognitionTimeout)
      recognitionTimeout = null
    }
    
    isRecording.value = false
    
    // Сохраняем текст текущей сессии перед перезапуском
    if (currentSessionText.trim()) {
      accumulatedText = accumulatedText ? accumulatedText + ' ' + currentSessionText.trim() : currentSessionText.trim()
      transcript.value = accumulatedText
    }
    
    // Не перезапускаем, если кнопка не зажата
    if (!(shouldContinueRecording && shouldContinueRecording())) {
      return
    }

    // При любой ошибке пытаемся перезапустить, если кнопка еще зажата
    setTimeout(() => {
      cleanupRecognition()
      setTimeout(() => {
        if (!isDestroyed.value && shouldContinueRecording && shouldContinueRecording()) {
          initializeRecognition()
          startRecord()
        }
      }, 200)
    }, 100)
  }

  function onNoMatch() {
    if (isDestroyed.value) return
    // Даже при отсутствии совпадений продолжаем если кнопка зажата
    // Ничего не делаем здесь; управление происходит через shouldContinueRecording
  }

  function cleanupRecognition() {
    // Очищаем таймаут
    if (recognitionTimeout) {
      clearTimeout(recognitionTimeout)
      recognitionTimeout = null
    }
    
    if (recognition) {
      try {
        if (isRecording.value && recognition.stop) {
          recognition.stop()
        }
        // На некоторых браузерах требуется abort для мгновенной очистки
        if (recognition.abort) {
          try { recognition.abort() } catch (_) {}
        }
        
        // Очищаем все обработчики
        recognition.onstart = null
        recognition.onend = null
        recognition.onresult = null
        recognition.onerror = null
        recognition.onnomatch = null
        
        recognition = null
      } catch (error) {
        console.error('Ошибка очистки recognition:', error)
      }
    }
    
    isRecording.value = false
    // НЕ очищаем transcript и накопленный текст здесь
  }

  function destroy() {
    isDestroyed.value = true
    cleanupRecognition()
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

  // Автоматическая очистка при размонтировании компонента
  onBeforeUnmount(() => {
    destroy()
  })

  return {
    isRecording,
    isApiAvailable,
    startRecord,
    stopRecord,
    onFinish,
    transcript,
    destroy,
    cleanup: cleanupRecognition,
    setShouldContinueCallback,
    resetAccumulatedText
  }
}

export default useSpeechRecognition
