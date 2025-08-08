# useEventBus Module

Глобальный модуль для рассылки событий между компонентами Vue.js.

## Использование

### Подписка на события
```javascript
import useEventBus from 'src/modules/useEventBus'

const { on } = useEventBus()

// Подписка на событие
const unsubscribe = on('event-name', (data) => {
  console.log('Event received:', data)
})

// Отписка от события
unsubscribe()
```

### Отправка событий
```javascript
import useEventBus from 'src/modules/useEventBus'

const { emit } = useEventBus()

// Отправка события с данными
emit('event-name', { message: 'Hello World' })
```

## API

### `on(event, callback)`
Подписывается на событие.
- `event` (string) - название события
- `callback` (Function) - функция обратного вызова
- Возвращает функцию для отписки

### `emit(event, data)`
Отправляет событие всем подписчикам.
- `event` (string) - название события
- `data` (*) - данные события

### `off(event)`
Удаляет все слушатели для указанного события.
- `event` (string) - название события

### `clear()`
Удаляет все события и слушатели.
