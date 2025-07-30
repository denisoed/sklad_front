# useKeyboardHandler

Модуль для автоматического закрытия мобильной клавиатуры при нажатии кнопки "Done".

## Описание

Этот модуль добавляет глобальные обработчики событий для автоматического закрытия встроенной клавиатуры на мобильных устройствах (iOS и Android) при нажатии кнопки "Done" или клавиши Enter.

## Использование

### Автоматическая инициализация

```javascript
import useKeyboardHandler from 'src/modules/useKeyboardHandler'

export default {
  setup() {
    // Автоматически настраивает обработчики при монтировании компонента
    useKeyboardHandler()
    
    // ... остальной код
  }
}
```

### Ручное управление

```javascript
import useKeyboardHandler from 'src/modules/useKeyboardHandler'

export default {
  setup() {
    const { setupKeyboardHandlers, cleanupKeyboardHandlers } = useKeyboardHandler()
    
    onMounted(() => {
      setupKeyboardHandlers()
    })
    
    onUnmounted(() => {
      cleanupKeyboardHandlers()
    })
  }
}
```

## Требования

Для работы модуля необходимо добавить атрибут `enterkeyhint="done"` к input полям:

```vue
<q-input
  v-model="value"
  enterkeyhint="done"
  outlined
  label="Введите значение"
/>
```

## Обрабатываемые события

- **keydown** - нажатие клавиши Enter
- **beforeinput** - события перед вводом (для обработки кнопки "Done" на мобильной клавиатуре)

## Поддерживаемые элементы

- `<input>` элементы
- `<textarea>` элементы
- `q-input` компоненты (Quasar)

## Особенности

- Автоматически определяет мобильные устройства
- Добавляет задержки для корректной работы на мобильных платформах
- Корректно очищает обработчики при размонтировании
- Работает с вложенными элементами в q-input компонентах
- **Не закрывает клавиатуру во время ввода текста** - только при нажатии Enter или кнопки Done

## Примеры использования

### В App.vue (рекомендуется)

```javascript
import useKeyboardHandler from 'src/modules/useKeyboardHandler'

export default {
  setup() {
    // Инициализация обработчика клавиатуры
    useKeyboardHandler()
    
    // ... остальной код
  }
}
```

### В отдельных компонентах

```javascript
import useKeyboardHandler from 'src/modules/useKeyboardHandler'

export default {
  setup() {
    // Обработчик будет работать только для этого компонента
    useKeyboardHandler()
    
    return {
      // ... возвращаемые значения
    }
  }
}
``` 