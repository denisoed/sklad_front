import { ref } from 'vue'

const useSpeechRecognition = () => {
  const transcript = ref('')
  const isRecording = ref(false)
  const isApiAvailable = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  const recognition = isApiAvailable ? new webkitSpeechRecognition() : {}
  let finishCallback = null

  function onFinish(callback) {
    finishCallback = callback
  }

  function startRecord() {
    try {
      if (!isRecording.value) {
        recognition.start()
      }
    } catch (error) {
      console.error('Ошибка начала записи:', error)
    }
  }

  function stopRecord() {
    try {
      if (isRecording.value) {
        recognition.stop()
      }
    } catch (error) {
      console.error('Ошибка остановки записи:', error)
    }
  }

  function onStart() {
    isRecording.value = true
    transcript.value = '' // Сбрасываем текст при начале записи
  }

  function onEnd() {
    isRecording.value = false
    // Вызываем callback с финальным текстом только если есть результат
    if (finishCallback && transcript.value.trim()) {
      finishCallback(transcript.value)
    }
  }

  function onResult({ results }) {
    const arr = Array.from(results)
      .map(result => result[0])
      .map(alternative => alternative.transcript)
    transcript.value = arr.join('')
  }

  // Настройка распознавания речи
  if (isApiAvailable) {
    recognition.lang = 'ru-RU'
    recognition.interimResults = true
    recognition.continuous = true // Изменяем на true для непрерывной записи
    recognition.onstart = onStart
    recognition.onend = onEnd
    recognition.onresult = onResult
  }

  return {
    isRecording,
    isApiAvailable,
    startRecord,
    stopRecord,
    onFinish,
    transcript
  }
}

export default useSpeechRecognition
