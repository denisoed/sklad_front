import { ref, onBeforeUnmount } from 'vue'

const useSpeechRecognition = () => {
  const transcript = ref('')
  const isRecording = ref(false)
  const isApiAvailable = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  
  // Создаем новый экземпляр для каждого использования
  let recognition = null
  let finishCallback = null
  let isDestroyed = ref(false)

  function initializeRecognition() {
    if (!isApiAvailable || recognition) {
      return
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognition()
      
      recognition.lang = 'ru-RU'
      recognition.interimResults = true
      recognition.continuous = false // Лучше false для более стабильной работы
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

  function startRecord() {
    if (isDestroyed.value) return
    
    try {
      if (!recognition) {
        initializeRecognition()
      }
      
      if (recognition && !isRecording.value) {
        transcript.value = ''
        recognition.start()
      }
    } catch (error) {
      console.error('Ошибка начала записи:', error)
      // Если произошла ошибка, попробуем переинициализировать
      cleanupRecognition()
      initializeRecognition()
    }
  }

  function stopRecord() {
    if (isDestroyed.value) return
    
    try {
      if (recognition && isRecording.value) {
        recognition.stop()
      }
    } catch (error) {
      console.error('Ошибка остановки записи:', error)
    }
  }

  function onStart() {
    if (isDestroyed.value) return
    isRecording.value = true
  }

  function onEnd() {
    if (isDestroyed.value) return
    
    isRecording.value = false
    // Вызываем callback с финальным текстом только если есть результат
    if (finishCallback && transcript.value.trim()) {
      finishCallback(transcript.value)
    }
  }

  function onResult({ results }) {
    if (isDestroyed.value) return
    
    try {
      const arr = Array.from(results)
        .map(result => result[0])
        .map(alternative => alternative.transcript)
      transcript.value = arr.join('')
    } catch (error) {
      console.error('Ошибка обработки результата:', error)
    }
  }

  function onError(event) {
    if (isDestroyed.value) return
    
    console.error('Ошибка распознавания речи:', event.error)
    isRecording.value = false
    
    // При некоторых ошибках нужно переинициализировать
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      cleanupRecognition()
    }
  }

  function onNoMatch() {
    if (isDestroyed.value) return
    console.log('Речь не распознана')
    isRecording.value = false
  }

  function cleanupRecognition() {
    if (recognition) {
      try {
        if (isRecording.value) {
          recognition.stop()
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
    transcript.value = ''
  }

  function destroy() {
    isDestroyed.value = true
    cleanupRecognition()
    finishCallback = null
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
    cleanup: cleanupRecognition
  }
}

export default useSpeechRecognition
