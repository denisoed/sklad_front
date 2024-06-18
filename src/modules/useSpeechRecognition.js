import { ref } from 'vue'

const useSpeechRecognition = () => {
  const transcript = ref('')
  const isRecording = ref(false)
  const isApiAvailable = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  const recognition = isApiAvailable ? new webkitSpeechRecognition() : {}

  const proxyHandler = {
    callback: null,
    apply: function (target, thisArg, argumentsList) {
      const result = target(argumentsList);
      this.callback?.(transcript.value);
      return result;
    },
  };

  function onFinish(cd) {
    proxyHandler.callback = cd;
  }

  function toggleRecord() {
    try {
      recognition.start()
    } catch {
      recognition.stop()
    }
  }

  function onStart() {
    isRecording.value = true
  }

  function onEnd() {
    isRecording.value = false
  }
  const proxyOnEnd = new Proxy(onEnd, proxyHandler);

  function onResult({ results }) {
    const arr = Array.from(results)
      .map(result => result[0])
      .map(alternative => alternative.transcript)
    transcript.value = arr.join('')
  }

  recognition.lang = 'ru-RU'
  recognition.interimResults = true
  recognition.continuous = true
  recognition.onstart = onStart
  recognition.onend = proxyOnEnd
  recognition.onresult = onResult

  return {
    isRecording,
    isApiAvailable,
    toggleRecord,
    onFinish,
    transcript
  }
}

export default useSpeechRecognition
