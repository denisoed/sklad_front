import { onMounted, onUnmounted } from 'vue'

export default function useKeyboardHandler() {
  function handleKeydown(event) {
    if (event.key === 'Enter') {
      
      const target = event.target;
      
      // Проверяем, является ли элемент input или textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Проверяем атрибут enterkeyhint
        if (target.getAttribute('enterkeyhint') === 'done') {
          event.preventDefault();
          target.blur();
          
          // Дополнительно для мобильных устройств
          if (window.navigator.userAgent.includes('Mobile')) {
            // Небольшая задержка для корректного закрытия клавиатуры
            setTimeout(() => {
              target.blur();
            }, 100);
          }
        }
      }
      
      // Также проверяем родительские элементы для q-input
      let currentElement = target;
      while (currentElement && currentElement !== document.body) {
        if (currentElement.classList && currentElement.classList.contains('q-input')) {
          const inputElement = currentElement.querySelector('input, textarea');
          if (inputElement && inputElement.getAttribute('enterkeyhint') === 'done') {
            event.preventDefault();
            inputElement.blur();
            
            if (window.navigator.userAgent.includes('Mobile')) {
              setTimeout(() => {
                inputElement.blur();
              }, 100);
            }
            break;
          }
        }
        currentElement = currentElement.parentElement;
      }
    }
  }

  function handleBeforeInput(event) {
    const target = event.target;
    
    // Обработка кнопки Done на мобильной клавиатуре
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      if (target.getAttribute('enterkeyhint') === 'done') {
        // Проверяем, если это событие от кнопки Done (data === null означает Done)
        if (event.inputType === 'insertText' && event.data === null) {
          event.preventDefault();
          target.blur();
        }
      }
    }
  }

  function setupKeyboardHandlers() {
    // Глобальный обработчик для закрытия клавиатуры при нажатии Enter
    document.addEventListener('keydown', handleKeydown);
    
    // Обработчик для кнопки Done на мобильной клавиатуре
    document.addEventListener('beforeinput', handleBeforeInput);
  }

  function cleanupKeyboardHandlers() {
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('beforeinput', handleBeforeInput);
  }

  // Автоматическая настройка при использовании в setup()
  onMounted(() => {
    setupKeyboardHandlers();
  });

  onUnmounted(() => {
    cleanupKeyboardHandlers();
  });

  return {
    setupKeyboardHandlers,
    cleanupKeyboardHandlers
  }
} 