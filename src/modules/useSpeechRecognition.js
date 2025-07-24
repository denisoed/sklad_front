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

  function toggleRecord() {
    try {
      if (isRecording.value) {
        recognition.stop()
      } else {
        recognition.start()
      }
    } catch (error) {
      console.error('Ошибка переключения записи:', error)
    }
  }

  function onStart() {
    isRecording.value = true
    transcript.value = '' // Сбрасываем текст при начале записи
  }

  function onEnd() {
    isRecording.value = false
    // Вызываем callback с финальным текстом
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
    recognition.continuous = false // Изменяем на false для автоматического завершения
    recognition.onstart = onStart
    recognition.onend = onEnd
    recognition.onresult = onResult
  }

  return {
    isRecording,
    isApiAvailable,
    toggleRecord,
    onFinish,
    transcript
  }
}

export default useSpeechRecognition
