import { onMounted, onUnmounted } from 'vue'

export default function useKeyboardHandler() {
  function handleKeydown(event) {
    if (event.key === 'Enter') {
      
      const target = event.target;
      
      // Check if the element is an input or textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Check the enterkeyhint attribute
        if (target.getAttribute('enterkeyhint') === 'done') {
          event.preventDefault();
          target.blur();
          
          // Additionally for mobile devices
          if (window.navigator.userAgent.includes('Mobile')) {
            // Small delay for proper keyboard closing
            setTimeout(() => {
              target.blur();
            }, 100);
          }
        }
      }
      
      // Also check parent elements for q-input
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
    
    // Handle Done button on mobile keyboard
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      if (target.getAttribute('enterkeyhint') === 'done') {
        // Check if this is an event from the Done button (data === null means Done)
        if (event.inputType === 'insertText' && event.data === null) {
          event.preventDefault();
          target.blur();
        }
      }
    }
  }

  function setupKeyboardHandlers() {
    // Global handler for closing keyboard on Enter press
    document.addEventListener('keydown', handleKeydown);
    
    // Handler for Done button on mobile keyboard
    document.addEventListener('beforeinput', handleBeforeInput);
  }

  function cleanupKeyboardHandlers() {
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('beforeinput', handleBeforeInput);
  }

  // Automatic setup when used in setup()
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