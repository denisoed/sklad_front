<template>
  <div v-if="isApiAvailable" class="rec-form-data">
    <div ref="btnRef" class="pulsediv" />
    <q-btn
      color="primary"
      push
      round
      :icon="isRecording ? 'mdi-microphone' : 'mdi-microphone-outline'"
      size="lg"
      @click="onClick"
      v-vibrate
    />
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  watch
} from 'vue'
import useSpeechRecognition from 'src/modules/useSpeechRecognition'
import useScroller from 'src/modules/useScroller'
import debounce from 'lodash.debounce'

const FIELD_NAMES = [
  {
    key: 'sklad',
    value: 'склад',
    type: 'string',
    formatter: (str) => {
      return str
    }
  },
  {
    key: 'category',
    value: 'категория',
    type: 'string',
    formatter: (str) => {
      return str
    }
  },
  {
    key: 'name',
    value: 'название',
    type: 'string',
    formatter: (str) => {
      return str
    }
  },
  {
    key: 'origPrice',
    value: 'оптовая цена',
    type: 'number',
    formatter: (str) => {
      return str.replace(/\D/g, '')
    }
  },
  {
    key: 'newPrice',
    value: 'розничная цена',
    type: 'number',
    formatter: (str) => {
      return str.replace(/\D/g, '')
    }
  },
  {
    key: 'color',
    value: 'цвет',
    type: 'string',
    formatter: (str) => {
      return str
    }
  },
  {
    key: 'countSizes',
    value: 'количество',
    type: 'string',
    formatter: (str) => {
      return str
    }
  },
];

export default defineComponent({
  name: 'RecFormData',
  emits: ['on-result', 'on-finish'],
  setup(_, { emit }) {
    const {
      isRecording,
      toggleRecord,
      onFinish,
      transcript,
      isApiAvailable
    } = useSpeechRecognition();
    const { scrollBySelector } = useScroller();
    const btnRef = ref();

    function getResult(voiceInput) {
      const regex = new RegExp(FIELD_NAMES.map(field => `(${field.value})`).join('|'), 'ig');
      const tokens = voiceInput.split(regex).map(token => token?.trim()).filter(Boolean);
      const finalTokens = {};
      let currentKey = null;
      let current = null;

      tokens.forEach(token => {
        const matchingField = FIELD_NAMES.find(field => new RegExp(field.value, 'ig').test(token));
        if (matchingField) {
          currentKey = matchingField.key;
          current = matchingField;
        } else if (currentKey) {
          finalTokens[currentKey] = current?.formatter(token);
        }
      });
      return {
        currentKey,
        finalTokens
      };
    }

    function onClick() {
      toggleRecord();
      if (!isRecording.value) {
        btnRef.value.classList.remove('pulse');
        setTimeout(() => btnRef.value.classList.add('pulse'), 0);
      }
    }

    onFinish((result) => {
      emit('on-finish', getResult(result));
    })

    const debouncedWatch = debounce((val) => {
      scrollBySelector(getResult(val)?.currentKey)
      emit('on-result', getResult(val))
    }, 500);

    watch(transcript, debouncedWatch)

    return {
      isRecording,
      onClick,
      btnRef,
      isApiAvailable
    }
  }
})
</script>

<style lang="scss" scoped>
.rec-form-data {
  position: relative;
}

.pulsediv {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  background: var(--q-primary);
  cursor: pointer;
  box-shadow: 0 0 0 0 rgba(var(--q-primary-rgb), 0.5);
}

.pulse {
  animation: pulse 2s;
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 50px rgba(var(--q-primary-rgb), 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(var(--q-primary-rgb), 0);
  }
}
</style>
